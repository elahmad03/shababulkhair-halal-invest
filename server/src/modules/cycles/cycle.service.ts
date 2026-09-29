/**
 * cycle.service.ts — Investment Cycle lifecycle and share investments
 * Ventures → venture.service.ts | Ledger → ledger.service.ts
 */

import {
  CycleStatus,
  DistributionStatus,
  Prisma,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { prisma } from "../../config/prisma";
import { notifyCycleOpened, notifyCycleClosed } from "./cycle.notifications";
import type {
  CreateCycleInput,
  UpdateCycleInput,
  CompleteCycleInput,
  UpdateCycleStatusInput,
  DistributeProfitInput,
} from "./cycle.validation";
import { autoInvestQueue } from "../../jobs/queues/autoInvest.queue";
import { toKobo } from "../shared/money";
import { serializeBigInts } from "../shared/serializer";

export default class CycleService {
  // ── CREATE ────────────────────────────────────────────────────────────────

  static async createCycle(input: CreateCycleInput) {
    const cycle = await prisma.investmentCycle.create({
      data: {
        cycleName: input.cycleName,
        pricePerShareKobo: toKobo(input.pricePerShareNaira ?? 10_000),
        fundingOpensAt: input.fundingOpensAt ? new Date(input.fundingOpensAt) : null,
        fundingClosesAt: input.fundingClosesAt ? new Date(input.fundingClosesAt) : null,
        activeStartsAt: input.activeStartsAt ? new Date(input.activeStartsAt) : null,
        activeEndsAt: input.activeEndsAt ? new Date(input.activeEndsAt) : null,
        description: input.description ?? null,
        status: CycleStatus.PENDING,
      },
    });
    return serializeBigInts(cycle);
  }

  // ── UPDATE (PENDING only) ─────────────────────────────────────────────────

  static async updateCycle(cycleId: string, input: UpdateCycleInput) {
    const cycle = await prisma.investmentCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new Error("Cycle not found");
    if (cycle.status !== CycleStatus.PENDING) {
      throw new Error(
        `Cannot update cycle details — only PENDING cycles can be edited (current status: "${cycle.status}")`
      );
    }

    const updated = await prisma.investmentCycle.update({
      where: { id: cycleId },
      data: {
        ...(input.cycleName && { cycleName: input.cycleName }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.fundingOpensAt !== undefined && { 
          fundingOpensAt: input.fundingOpensAt ? new Date(input.fundingOpensAt) : null 
        }),
        ...(input.fundingClosesAt !== undefined && { 
          fundingClosesAt: input.fundingClosesAt ? new Date(input.fundingClosesAt) : null 
        }),
        ...(input.activeStartsAt !== undefined && { 
          activeStartsAt: input.activeStartsAt ? new Date(input.activeStartsAt) : null 
        }),
        ...(input.activeEndsAt !== undefined && { 
          activeEndsAt: input.activeEndsAt ? new Date(input.activeEndsAt) : null 
        }),
      },
    });
    return serializeBigInts(updated);
  }

  // ── STATUS TRANSITIONS ────────────────────────────────────────────────────

  static async updateCycleStatus(
    cycleId: string,
    input: UpdateCycleStatusInput,
    adminId: string
  ) {
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id: cycleId },
      include: { investments: true },
    });

    if (!cycle) throw new Error("Cycle not found");
    if (cycle.status === input.status) {
      throw new Error(`Cycle is already in ${input.status} status`);
    }

    // Validate forward-only transitions
    const statusOrder = [
      CycleStatus.PENDING,
      CycleStatus.OPEN_FOR_INVESTMENT,
      CycleStatus.ACTIVE,
      CycleStatus.CLOSING,
      CycleStatus.COMPLETED,
    ];
    const currentIndex = statusOrder.indexOf(cycle.status);
    const targetIndex = statusOrder.indexOf(input.status as CycleStatus);

    if (targetIndex <= currentIndex) {
      throw new Error(
        `Cannot transition from ${cycle.status} to ${input.status} — transitions must be forward only`
      );
    }

    // PENDING → OPEN_FOR_INVESTMENT
    if (cycle.status === CycleStatus.PENDING && input.status === CycleStatus.OPEN_FOR_INVESTMENT) {
      const updated = await prisma.investmentCycle.update({
        where: { id: cycleId },
        data: { status: CycleStatus.OPEN_FOR_INVESTMENT },
      });

      // Fire-and-forget: notify members (never throws)
      notifyCycleOpened({
        cycleId: updated.id,
        cycleName: updated.cycleName,
        pricePerShareKobo: updated.pricePerShareKobo,
        endDate: updated.fundingClosesAt ?? updated.activeEndsAt,
      });

      // Fire-and-forget: enqueue auto-invest job for opted-in members.
      // jobId = cycleId ensures this job is deduplicated — safe if called twice.
      autoInvestQueue
        .add(
          "auto-invest",
          { cycleId: updated.id },
          {
            jobId: `auto-invest:${updated.id}`,
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 },
          }
        )
        .catch((err) => {
          console.error(
            `[CycleService] Failed to enqueue autoInvest job for cycle ${updated.id}:`,
            err
          );
        });

      return serializeBigInts(updated);
    }

    // OPEN_FOR_INVESTMENT → ACTIVE
    if (cycle.status === CycleStatus.OPEN_FOR_INVESTMENT && input.status === CycleStatus.ACTIVE) {
      const activeCycle = await prisma.investmentCycle.findFirst({
        where: { status: CycleStatus.ACTIVE, id: { not: cycleId } },
      });
      if (activeCycle) {
        throw new Error(
          `Another cycle ("${activeCycle.cycleName}") is already ACTIVE. Only one cycle can be ACTIVE at a time.`
        );
      }

      const updated = await prisma.investmentCycle.update({
        where: { id: cycleId },
        data: { status: CycleStatus.ACTIVE },
      });

      notifyCycleClosed({
        cycleId: updated.id,
        cycleName: updated.cycleName,
      });

      return serializeBigInts(updated);
    }

    // ACTIVE → CLOSING
    if (cycle.status === CycleStatus.ACTIVE && input.status === CycleStatus.CLOSING) {
      const updated = await prisma.investmentCycle.update({
        where: { id: cycleId },
        data: { status: CycleStatus.CLOSING },
      });

      // Notify all investors
      const notificationData = cycle.investments.map((inv) => ({
        userId: inv.userId,
        title: "Disbursement Window Open",
        message: `${updated.cycleName} is closing. Please review your disbursement options.`,
        link: `/user/cycles/${cycleId}`,
      }));

      if (notificationData.length > 0) {
        await prisma.notification.createMany({ data: notificationData });
      }

      return serializeBigInts(updated);
    }

    // CLOSING → COMPLETED
    if (cycle.status === CycleStatus.CLOSING && input.status === CycleStatus.COMPLETED) {
      if (cycle.profitDistributionStatus !== DistributionStatus.COMPLETED) {
        throw new Error(
          "Cannot complete cycle — profit distribution must be finalized and recorded first"
        );
      }

      const updated = await prisma.investmentCycle.update({
        where: { id: cycleId },
        data: { status: CycleStatus.COMPLETED },
      });

      return serializeBigInts(updated);
    }

    throw new Error(`Unsupported status transition from ${cycle.status} to ${input.status}`);
  }

  // ── PROFIT DISTRIBUTION & PAYOUT ───────────────────────────────────────────

  static async distributeProfit(
    cycleId: string,
    adminId: string,
    input: DistributeProfitInput
  ) {
    return await prisma.$transaction(async (tx) => {
      const cycle = await tx.investmentCycle.findUnique({
        where: { id: cycleId },
        include: { investments: true, businessVentures: true },
      });

      if (!cycle) throw new Error("Cycle not found");
      if (cycle.status !== CycleStatus.CLOSING) {
        throw new Error(
          `Cannot distribute profit — cycle status must be CLOSING, current status is "${cycle.status}"`
        );
      }
      if (cycle.profitDistributionStatus === DistributionStatus.COMPLETED) {
        throw new Error("Profit already distributed for this cycle");
      }

      // Aggregate realized profits from all business ventures if cycle total is zero
      let totalProfit = cycle.totalProfitRealizedKobo;
      if (totalProfit === 0n && cycle.businessVentures.length > 0) {
        totalProfit = cycle.businessVentures.reduce(
          (sum, v) => sum + v.profitRealizedKobo,
          0n
        );
      }

      // Percentage calculation via basis points (e.g. 80.5% -> 8050 bps)
      const investorBps = BigInt(Math.round(input.investorProfitPercentage * 100));
      const totalBps = 10000n;

      const investorPoolKobo = (totalProfit * investorBps) / totalBps;
      const orgShareKobo = totalProfit - investorPoolKobo;
      const orgPercentage = 100 - input.investorProfitPercentage;

      // 1. Create ProfitDistribution audit record
      const distribution = await tx.profitDistribution.create({
        data: {
          cycleId,
          authorisedById: adminId,
          investorProfitPercentage: input.investorProfitPercentage,
          orgProfitPercentage: orgPercentage,
          totalProfitKobo: totalProfit,
          investorProfitPoolKobo: investorPoolKobo,
          orgProfitShareKobo: orgShareKobo,
          notes: input.notes ?? null,
        },
      });

      // 2. Calculate and distribute profit + unlock capital to member wallets
      const totalShares = cycle.investments.reduce(
        (sum, i) => sum + i.sharesAllocated,
        0n
      );

      for (const inv of cycle.investments) {
        const profitShare =
          totalShares > 0n ? (investorPoolKobo * inv.sharesAllocated) / totalShares : 0n;

        // Update shareholder record
        await tx.shareholderInvestment.update({
          where: { id: inv.id },
          data: { profitEarnedKobo: profitShare },
        });

        // Move initial locked balance back to liquid balance + credit profit yield
        const totalPayout = inv.amountInvestedKobo + profitShare;
        await tx.wallet.update({
          where: { userId: inv.userId },
          data: {
            lockedBalanceKobo: { decrement: inv.amountInvestedKobo },
            balanceKobo: { increment: totalPayout },
          },
        });

        // Record profit transaction log
        if (profitShare > 0n) {
          await tx.transaction.create({
            data: {
              userId: inv.userId,
              transactionType: TransactionType.PROFIT_DISTRIBUTION,
              amountKobo: profitShare,
              transactionStatus: TransactionStatus.COMPLETED,
              narration: `Profit yield from ${cycle.cycleName}`,
              relatedEntityType: "INVESTMENT_CYCLE",
              relatedEntityId: cycleId,
            },
          });
        }
      }

      // 3. Mark cycle as distribution completed
      const updated = await tx.investmentCycle.update({
        where: { id: cycleId },
        data: {
          profitDistributionStatus: DistributionStatus.COMPLETED,
          totalProfitRealizedKobo: totalProfit,
          investorProfitPoolKobo: investorPoolKobo,
          orgProfitShareKobo: orgShareKobo,
        },
      });

      return serializeBigInts({ cycle: updated, distribution });
    });
  }

  // ── HELPER SHORTCUTS ──────────────────────────────────────────────────────

  static async openCycle(cycleId: string, adminId: string) {
    return this.updateCycleStatus(
      cycleId,
      { status: CycleStatus.OPEN_FOR_INVESTMENT },
      adminId
    );
  }

  static async activateCycle(cycleId: string, adminId: string) {
    return this.updateCycleStatus(
      cycleId,
      { status: CycleStatus.ACTIVE },
      adminId
    );
  }

  static async completeCycle(
    cycleId: string,
    adminId: string,
    input: CompleteCycleInput
  ) {
    const cycle = await prisma.investmentCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new Error("Cycle not found");

    if (cycle.status === CycleStatus.ACTIVE) {
      await this.updateCycleStatus(cycleId, { status: CycleStatus.CLOSING }, adminId);
    }

    if (cycle.profitDistributionStatus !== DistributionStatus.COMPLETED) {
      await this.distributeProfit(cycleId, adminId, {
        investorProfitPercentage: input.investorProfitPercent,
        notes: "Automated distribution during completion",
      });
    }

    return this.updateCycleStatus(cycleId, { status: CycleStatus.COMPLETED }, adminId);
  }

  // ── SHARE PURCHASE / INVEST ───────────────────────────────────────────────

  static async purchaseShares(
    userId: string,
    cycleId: string,
    quantity: number,
    idempotencyKey?: string
  ) {
    return await prisma.$transaction(
      async (tx) => {
        if (idempotencyKey) {
          const keyRecord = await tx.idempotencyKey.findUnique({
            where: { key: idempotencyKey },
          });

          if (keyRecord) {
            if (keyRecord.responseBody) {
              return keyRecord.responseBody; // Return cached response safely
            }
            throw new Error("Transaction is currently being processed. Please wait.");
          }

          await tx.idempotencyKey.create({
            data: {
              key: idempotencyKey,
              userId,
              requestMethod: "POST",
              requestPath: `/cycles/${cycleId}/invest`,
            },
          });
        }

        const cycle = await tx.investmentCycle.findUnique({
          where: { id: cycleId },
          select: { id: true, status: true, pricePerShareKobo: true, cycleName: true },
        });

        if (!cycle) throw new Error("Cycle not found");
        if (cycle.status !== CycleStatus.OPEN_FOR_INVESTMENT) {
          throw new Error(
            `Cycle is not open for investment — status is "${cycle.status}"`
          );
        }

        const qty = BigInt(quantity);
        const totalCost = cycle.pricePerShareKobo * qty;
        const wallet = await tx.wallet.findUnique({ where: { userId } });

        if (!wallet) {
          throw new Error("Wallet not found. Please fund your account first.");
        }
        if (wallet.balanceKobo < totalCost) {
          throw new Error("Insufficient wallet balance for this share purchase.");
        }

        // Lock funds
        await tx.wallet.update({
          where: { userId },
          data: {
            balanceKobo: { decrement: totalCost },
            lockedBalanceKobo: { increment: totalCost },
          },
        });

        const existing = await tx.shareholderInvestment.findUnique({
          where: { userId_cycleId: { userId, cycleId } },
        });

        const investment = existing
          ? await tx.shareholderInvestment.update({
              where: { userId_cycleId: { userId, cycleId } },
              data: {
                sharesAllocated: { increment: qty },
                amountInvestedKobo: { increment: totalCost },
              },
            })
          : await tx.shareholderInvestment.create({
              data: {
                userId,
                cycleId,
                sharesAllocated: qty,
                amountInvestedKobo: totalCost,
              },
            });

        await tx.transaction.create({
          data: {
            userId,
            transactionType: TransactionType.SHARE_PURCHASE,
            amountKobo: totalCost,
            transactionStatus: TransactionStatus.COMPLETED,
            narration: `${quantity} share(s) in ${cycle.cycleName}`,
            relatedEntityType: "INVESTMENT_CYCLE",
            relatedEntityId: cycleId,
          },
        });

        const result = serializeBigInts({
          investment,
          investmentId: investment.id,
          sharesAllocated: investment.sharesAllocated,
          amountInvestedKobo: investment.amountInvestedKobo,
          pricePerShareKobo: cycle.pricePerShareKobo,
          totalCostKobo: totalCost,
        });

        // Save result payload to idempotency record
        if (idempotencyKey) {
          const jsonSafe = JSON.parse(
            JSON.stringify(result, (_key, val) =>
              typeof val === "bigint" ? val.toString() : val
            )
          ) as Prisma.InputJsonValue;

          await tx.idempotencyKey.update({
            where: { key: idempotencyKey },
            data: {
              responseCode: 200,
              responseBody: jsonSafe,
            },
          });
        }

        return result;
      },
      { isolationLevel: "Serializable" }
    );
  }

  // ── QUERIES ───────────────────────────────────────────────────────────────

  static async listCycles(page = 1, limit = 10, status?: CycleStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [cycles, total] = await prisma.$transaction([
      prisma.investmentCycle.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          cycleName: true,
          status: true,
          pricePerShareKobo: true,
          fundingOpensAt: true,
          fundingClosesAt: true,
          activeStartsAt: true,
          activeEndsAt: true,
          description: true,
          totalProfitRealizedKobo: true,
          investorProfitPoolKobo: true,
          orgProfitShareKobo: true,
          profitDistributionStatus: true,
          createdAt: true,
          _count: { select: { investments: true, businessVentures: true } },
        },
      }),
      prisma.investmentCycle.count({ where }),
    ]);

    const serialized = serializeBigInts(cycles);
    return {
      cycles: serialized,
      data: serialized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getCycleById(cycleId: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id: cycleId },
      include: {
        investments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        businessVentures: {
          include: {
            managedBy: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        organizationalLedgers: {
          include: {
            recordedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });
    if (!cycle) throw new Error("Cycle not found");
    return serializeBigInts(cycle);
  }

  static async getMemberPosition(userId: string, cycleId: string) {
    const [investment, cycle] = await prisma.$transaction([
      prisma.shareholderInvestment.findUnique({
        where: { userId_cycleId: { userId, cycleId } },
      }),
      prisma.investmentCycle.findUnique({
        where: { id: cycleId },
        select: { pricePerShareKobo: true, cycleName: true, status: true },
      }),
    ]);
    if (!cycle) throw new Error("Cycle not found");
    return serializeBigInts({
      investment: investment ?? null,
      invested: investment ?? null,
      cycle,
    });
  }

  static async getMemberInvestmentHistory(userId: string) {
    const investments = await prisma.shareholderInvestment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        cycle: {
          select: {
            id: true,
            cycleName: true,
            status: true,
            fundingOpensAt: true,
            fundingClosesAt: true,
            activeStartsAt: true,
            activeEndsAt: true,
            profitDistributionStatus: true,
          },
        },
      },
    });
    return serializeBigInts(investments);
  }

  static async getCycleInvestments(cycleId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [investments, total, aggregate] = await prisma.$transaction([
      prisma.shareholderInvestment.findMany({
        where: { cycleId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.shareholderInvestment.count({ where: { cycleId } }),
      prisma.shareholderInvestment.aggregate({
        where: { cycleId },
        _sum: { amountInvestedKobo: true, sharesAllocated: true },
      }),
    ]);

    return serializeBigInts({
      investments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalInvestedKobo: aggregate._sum.amountInvestedKobo ?? 0n,
      totalSharesAllocated: aggregate._sum.sharesAllocated ?? 0n,
    });
  }
}