/**
 * cycle.service.ts — lifecycle + share purchases only
 * Ventures → venture.service.ts | Ledger → ledger.service.ts
 */

import {
  CycleStatus, DistributionStatus,
  TransactionStatus, TransactionType,
} from "@prisma/client";
import { prisma } from "../../config/prisma";
import { notifyCycleOpened, notifyCycleClosed } from "./cycle.notifications";
import type { CreateCycleInput, CompleteCycleInput } from "./cycle.validators";
import { toKobo } from "../shared/money";
import { serializeBigInts } from "../shared/serializer";


export default class CycleService {

  // ── CREATE ────────────────────────────────────────────────────────────────

  static async createCycle(input: CreateCycleInput) {
    const cycle = await prisma.investmentCycle.create({
      data: {
        cycleName:         input.cycleName,
        pricePerShareKobo: toKobo(input.pricePerShareNaira),
        startDate:         input.startDate ? new Date(input.startDate) : null,
        endDate:           input.endDate   ? new Date(input.endDate)   : null,
        description:       input.description ?? null,
        status:            CycleStatus.PENDING,
      },
    });
    return serializeBigInts(cycle);
  }

  // ── OPEN (PENDING → OPEN_FOR_INVESTMENT) ─────────────────────────────────

  static async openCycle(cycleId: string) {
    const cycle = await prisma.investmentCycle.findUnique({ where: { id: cycleId } });

    if (!cycle) throw new Error("Cycle not found");
    if (cycle.status !== CycleStatus.PENDING) {
      throw new Error(
        `Cannot open cycle — current status is "${cycle.status}". Only PENDING cycles can be opened.`
      );
    }

    const updated = await prisma.investmentCycle.update({
      where: { id: cycleId },
      data:  { status: CycleStatus.OPEN_FOR_INVESTMENT },
    });

    // Fire-and-forget — notification failure must never affect cycle state
    notifyCycleOpened({
      cycleId:           updated.id,
      cycleName:         updated.cycleName,
      pricePerShareKobo: updated.pricePerShareKobo,
      endDate:           updated.endDate,
    });

    return serializeBigInts(updated);
  }

  // ── ACTIVATE (OPEN_FOR_INVESTMENT → ACTIVE) ───────────────────────────────

  static async activateCycle(cycleId: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where:   { id: cycleId },
      include: { investments: { select: { id: true } } },
    });

    if (!cycle) throw new Error("Cycle not found");
    if (cycle.status !== CycleStatus.OPEN_FOR_INVESTMENT) {
      throw new Error(`Cannot activate cycle — current status is "${cycle.status}".`);
    }
    if (cycle.investments.length === 0) {
      throw new Error("Cannot activate a cycle with no investors.");
    }

    const updated = await prisma.investmentCycle.update({
      where: { id: cycleId },
      data:  { status: CycleStatus.ACTIVE },
    });

    notifyCycleClosed({ cycleId: updated.id, cycleName: updated.cycleName });

    return serializeBigInts(updated);
  }

  // ── COMPLETE (ACTIVE → COMPLETED + distribute profits) ───────────────────

  static async completeCycle(cycleId: string, adminId: string, input: CompleteCycleInput) {
    const cycle = await prisma.investmentCycle.findUnique({
      where:   { id: cycleId },
      include: { investments: true },
    });

    if (!cycle)                                                   throw new Error("Cycle not found");
    if (cycle.status !== CycleStatus.ACTIVE)                     throw new Error(`Cannot complete cycle — status is "${cycle.status}".`);
    if (cycle.profitDistributionStatus === DistributionStatus.COMPLETED) throw new Error("Profit already distributed.");
    if (cycle.investments.length === 0)                          throw new Error("No investors found.");

    const totalShares = cycle.investments.reduce((s, i) => s + i.sharesAllocated, 0n);
    if (totalShares === 0n) throw new Error("Total shares allocated is zero.");

    const totalProfit      = cycle.totalProfitRealizedKobo;
    const investorPoolKobo = (totalProfit * BigInt(Math.round(input.investorProfitPercent))) / 100n;
    const orgShareKobo     = totalProfit - investorPoolKobo;

    const payouts = cycle.investments.map((inv) => ({
      userId:       inv.userId,
      investmentId: inv.id,
      capitalKobo:  inv.amountInvestedKobo,
      profitKobo:   (investorPoolKobo * inv.sharesAllocated) / totalShares,
      get totalKobo() { return this.capitalKobo + this.profitKobo; },
    }));

    await prisma.$transaction(
      async (tx) => {
        // Re-check inside tx — prevents concurrent double-completion
        const locked = await tx.investmentCycle.findUnique({
          where:  { id: cycleId },
          select: { status: true, profitDistributionStatus: true },
        });
        if (
          locked?.status !== CycleStatus.ACTIVE ||
          locked?.profitDistributionStatus === DistributionStatus.COMPLETED
        ) {
          throw new Error("Cycle state changed concurrently — aborting.");
        }

        for (const p of payouts) {
          await tx.wallet.upsert({
            where:  { userId: p.userId },
            create: { userId: p.userId, balanceKobo: p.totalKobo, lockedBalanceKobo: 0n },
            update: { balanceKobo: { increment: p.totalKobo } },
          });

          await tx.transaction.create({
            data: {
              userId: p.userId, transactionType: TransactionType.CAPITAL_RETURN,
              amountKobo: p.capitalKobo, transactionStatus: TransactionStatus.COMPLETED,
              narration: `Capital return — ${cycle.cycleName}`,
              relatedEntityType: "INVESTMENT_CYCLE", relatedEntityId: cycleId,
            },
          });

          if (p.profitKobo > 0n) {
            await tx.transaction.create({
              data: {
                userId: p.userId, transactionType: TransactionType.PROFIT_DISTRIBUTION,
                amountKobo: p.profitKobo, transactionStatus: TransactionStatus.COMPLETED,
                narration: `Profit distribution — ${cycle.cycleName}`,
                relatedEntityType: "INVESTMENT_CYCLE", relatedEntityId: cycleId,
              },
            });
          }

          await tx.shareholderInvestment.update({
            where: { id: p.investmentId },
            data:  { profitEarnedKobo: p.profitKobo },
          });
        }

        await tx.investmentCycle.update({
          where: { id: cycleId },
          data: {
            status:                   CycleStatus.COMPLETED,
            investorProfitPoolKobo:   investorPoolKobo,
            orgProfitShareKobo:       orgShareKobo,
            profitDistributionStatus: DistributionStatus.COMPLETED,
          },
        });
      },
      { timeout: 30_000, isolationLevel: "Serializable" }
    );

    return {
      cycleId,
      totalProfitKobo:  totalProfit.toString(),
      investorPoolKobo: investorPoolKobo.toString(),
      orgShareKobo:     orgShareKobo.toString(),
      investorsPaid:    payouts.length,
    };
  }

  // ── PURCHASE SHARES ───────────────────────────────────────────────────────

  static async purchaseShares(
    userId: string, cycleId: string, quantity: number, idempotencyKey: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const exists = await tx.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
      if (exists) throw new Error("Duplicate request detected");

      await tx.idempotencyKey.create({
        data: { key: idempotencyKey, userId, requestMethod: "POST", requestPath: "/cycles/shares/purchase" },
      });

      const cycle = await tx.investmentCycle.findUnique({
        where:  { id: cycleId },
        select: { id: true, status: true, pricePerShareKobo: true, cycleName: true },
      });

      if (!cycle) throw new Error("Cycle not found");
      if (cycle.status !== CycleStatus.OPEN_FOR_INVESTMENT) {
        throw new Error(`Cycle is not open for investment — status is "${cycle.status}"`);
      }

      const qty       = BigInt(quantity);
      const totalCost = cycle.pricePerShareKobo * qty;
      const wallet    = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet)                        throw new Error("Wallet not found. Please fund your account first.");
      if (wallet.balanceKobo < totalCost) throw new Error(
        `Insufficient funds. Required: ₦${(Number(totalCost)/100).toLocaleString()}, ` +
        `Available: ₦${(Number(wallet.balanceKobo)/100).toLocaleString()}`
      );

      await tx.wallet.update({ where: { userId }, data: { balanceKobo: { decrement: totalCost } } });

      const existing = await tx.shareholderInvestment.findUnique({
        where: { userId_cycleId: { userId, cycleId } },
      });

      const investment = existing
        ? await tx.shareholderInvestment.update({
            where: { userId_cycleId: { userId, cycleId } },
            data:  { sharesAllocated: { increment: qty }, amountInvestedKobo: { increment: totalCost } },
          })
        : await tx.shareholderInvestment.create({
            data: { userId, cycleId, sharesAllocated: qty, amountInvestedKobo: totalCost },
          });

      await tx.transaction.create({
        data: {
          userId, transactionType: TransactionType.SHARE_PURCHASE,
          amountKobo: totalCost, transactionStatus: TransactionStatus.COMPLETED,
          narration: `${quantity} share(s) in ${cycle.cycleName}`,
          relatedEntityType: "INVESTMENT_CYCLE", relatedEntityId: cycleId,
        },
      });

      return serializeBigInts({
        investmentId:       investment.id,
        sharesAllocated:    investment.sharesAllocated,
        amountInvestedKobo: investment.amountInvestedKobo,
        pricePerShareKobo:  cycle.pricePerShareKobo,
        totalCostKobo:      totalCost,
      });
    }, { isolationLevel: "Serializable" });
  }

  // ── QUERIES ───────────────────────────────────────────────────────────────

  static async listCycles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [cycles, total] = await prisma.$transaction([
      prisma.investmentCycle.findMany({
        orderBy: { createdAt: "desc" }, skip, take: limit,
        select: {
          id: true, cycleName: true, status: true, pricePerShareKobo: true,
          startDate: true, endDate: true, description: true,
          totalProfitRealizedKobo: true, profitDistributionStatus: true, createdAt: true,
          _count: { select: { investments: true, businessVentures: true } },
        },
      }),
      prisma.investmentCycle.count(),
    ]);
    return { data: serializeBigInts(cycles), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async getCycleById(cycleId: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where:   { id: cycleId },
      include: {
        investments: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        businessVentures: { include: { managedBy: { select: { id: true, firstName: true, lastName: true } } } },
        organizationalLedgers: { include: { recordedBy: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { date: "desc" } },
      },
    });
    if (!cycle) throw new Error("Cycle not found");
    return serializeBigInts(cycle);
  }

  static async getMemberPosition(userId: string, cycleId: string) {
    const [investment, cycle] = await prisma.$transaction([
      prisma.shareholderInvestment.findUnique({ where: { userId_cycleId: { userId, cycleId } } }),
      prisma.investmentCycle.findUnique({ where: { id: cycleId }, select: { pricePerShareKobo: true, cycleName: true, status: true } }),
    ]);
    if (!cycle) throw new Error("Cycle not found");
    return serializeBigInts({ invested: investment ?? null, cycle });
  }

  static async getMemberInvestmentHistory(userId: string) {
    const investments = await prisma.shareholderInvestment.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      include: {
        cycle: { select: { id: true, cycleName: true, status: true, startDate: true, endDate: true, profitDistributionStatus: true } },
      },
    });
    return serializeBigInts(investments);
  }
}