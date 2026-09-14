/**
 * cycle.service.ts — Investment Cycle lifecycle and share investments
 * Ventures → venture.service.ts | Ledger → ledger.service.ts
 */

import {
  CycleStatus,
  DistributionStatus,
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
import { toKobo } from "../shared/money";
import { serializeBigInts } from "../shared/serializer";

export default class CycleService {
  // ── CREATE ────────────────────────────────────────────────────────────────

  static async createCycle(input: CreateCycleInput) {
    const cycle = await prisma.investmentCycle.create({
      data: {
        cycleName: input.cycleName,
        pricePerShareKobo: toKobo(input.pricePerShareNaira ?? 10_000),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
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
      },
    });
    return serializeBigInts(updated);
  }

  // ── STATUS TRANSITIONS ────────────────────────────────────────────────────

  static async updateCycleStatus(
    cycleId: string,
    input: UpdateCycleStatusInput,
    _adminId: string
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
      notifyCycleOpened({
        cycleId: updated.id,
        cycleName: updated.cycleName,
        pricePerShareKobo: updated.pricePerShareKobo,
        endDate: updated.endDate,
      });
      return serializeBigInts(updated);
    }

    // OPEN_FOR_INVESTMENT → ACTIVE
    if (cycle.status === CycleStatus.OPEN_FOR_INVESTMENT && input.status === CycleStatus.ACTIVE) {
      // Enforce: only one ACTIVE cycle at a time
      const activeCycle = await prisma.investmentCycle.findFirst({
        where: { status: CycleStatus.ACTIVE, id: { not: cycleId } },
      });
      if (activeCycle) {
        throw new Error(
          `Another cycle ("${activeCycle.cycleName}") is already ACTIVE. Only one cycle can be ACTIVE at a time.`
        );
      }

      const durationDays = input.durationDays || 90;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const updated = await prisma.investmentCycle.update({
        where: { id: cycleId },
        data: {
          status: CycleStatus.ACTIVE,
          startDate,
          endDate,
        },
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

      // Notify all investors that disbursement window is open
      for (const inv of cycle.investments) {
        await prisma.notification.create({
          data: {
            userId: inv.userId,
            title: "Disbursement Window Open",
            message: `${updated.cycleName} is closing. Please review your disbursement options.`,
            link: `/user/cycles/${cycleId}`,
          },
        });
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

  // ── PROFIT DISTRIBUTION ───────────────────────────────────────────────────

  static async distributeProfit(
    cycleId: string,
    adminId: string,
    input: DistributeProfitInput
  ) {
    const cycle = await prisma.investmentCycle.findUnique({
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

    const investorPercentage = BigInt(Math.round(input.investorProfitPercentage * 100)) / 100n;
    const orgPercentage = 100n - investorPercentage;

    const investorPoolKobo =
      (totalProfit * BigInt(Math.round(input.investorProfitPercentage * 100))) / 10000n;
    const orgShareKobo = totalProfit - investorPoolKobo;

    // Create ProfitDistribution record
    const distribution = await prisma.profitDistribution.create({
      data: {
        cycleId,
        authorisedById: adminId,
        investorProfitPercentage: input.investorProfitPercentage,
        orgProfitPercentage: Number(orgPercentage),
        totalProfitKobo: totalProfit,
        investorProfitPoolKobo: investorPoolKobo,
        orgProfitShareKobo: orgShareKobo,
        notes: input.notes ?? null,
      },
    });

    // Compute and credit each member's profit share proportional to their shareholding
    const totalShares = cycle.investments.reduce(
      (sum, i) => sum + i.sharesAllocated,
      0n
    );

    for (const inv of cycle.investments) {
      const profitShare =
        totalShares > 0n ? (investorPoolKobo * inv.sharesAllocated) / totalShares : 0n;

      await prisma.shareholderInvestment.update({
        where: { id: inv.id },
        data: { profitEarnedKobo: profitShare },
      });
    }

    // Update cycle with profit distribution status and computed pools
    const updated = await prisma.investmentCycle.update({
      where: { id: cycleId },
      data: {
        profitDistributionStatus: DistributionStatus.COMPLETED,
        totalProfitRealizedKobo: totalProfit,
        investorProfitPoolKobo: investorPoolKobo,
        orgProfitShareKobo: orgShareKobo,
      },
    });

    return serializeBigInts({ cycle: updated, distribution });
  }

  // ── HELPER SHORTCUTS ──────────────────────────────────────────────────────

  static async openCycle(cycleId: string) {
    return this.updateCycleStatus(
      cycleId,
      { status: CycleStatus.OPEN_FOR_INVESTMENT },
      ""
    );
  }

  static async activateCycle(cycleId: string, durationDays = 90) {
    return this.updateCycleStatus(
      cycleId,
      { status: CycleStatus.ACTIVE, durationDays },
      ""
    );
  }

  static async completeCycle(
    cycleId: string,
    adminId: string,
    input: CompleteCycleInput
  ) {
    // If not distributed yet, auto-distribute with provided percentage first
    const cycle = await prisma.investmentCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new Error("Cycle not found");

    if (cycle.status === CycleStatus.ACTIVE) {
      await this.updateCycleStatus(cycleId, { status: CycleStatus.CLOSING }, adminId);
    }

    if (cycle.profitDistributionStatus !== DistributionStatus.COMPLETED) {
      await this.distributeProfit(cycleId, adminId, {
        investorProfitPercentage: input.investorProfitPercent,
        notes: "Automated distribution during complete",
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
        // Idempotency check if key provided
        if (idempotencyKey) {
          const exists = await tx.idempotencyKey.findUnique({
            where: { key: idempotencyKey },
          });
          if (exists) throw new Error("Duplicate request detected");

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
          throw new Error(
            `Insufficient funds. Required: ₦${(
              Number(totalCost) / 100
            ).toLocaleString()}, Available: ₦${(
              Number(wallet.balanceKobo) / 100
            ).toLocaleString()}`
          );
        }

        // Atomic wallet balance deduction and lockedBalance increment
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

        return serializeBigInts({
          investment,
          investmentId: investment.id,
          sharesAllocated: investment.sharesAllocated,
          amountInvestedKobo: investment.amountInvestedKobo,
          pricePerShareKobo: cycle.pricePerShareKobo,
          totalCostKobo: totalCost,
        });
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
          startDate: true,
          endDate: true,
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
      data: serialized, // for backwards compatibility with both data.cycles and data.data
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
            startDate: true,
            endDate: true,
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