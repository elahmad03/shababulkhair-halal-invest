import {
  CycleStatus,
  DistributionStatus,
  LedgerEntryType,
  TransactionStatus,
  TransactionType,
  DisbursementType,
} from "@prisma/client";
import { prisma } from "../../config/prisma";
import type {
  CreateCycleInput,
  CreateVentureInput,
  RecordLedgerEntryInput,
  CompleteCycleInput,
} from "./cycle.validators";

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Convert Naira (number) → kobo (BigInt), guarding against float drift */
const toKobo = (naira: number): bigint => BigInt(Math.round(naira * 100));

/** Serialize every BigInt in an object to string for safe JSON transport */
function serializeBigInts<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// =============================================================================
// CYCLE SERVICE
// =============================================================================

export default class CycleService {

  // ============================================================
  // ADMIN — CYCLE LIFECYCLE
  // ============================================================

  /**
   * Create a new investment cycle.
   * Only admins should reach this endpoint (enforced in the router).
   * Cycles start in PENDING status — no money moves yet.
   */
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

  /**
   * PENDING → OPEN_FOR_INVESTMENT
   * Opens the cycle so members can purchase shares.
   * Guard: cycle must currently be PENDING.
   */
  static async openCycle(cycleId: string, adminId: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) throw new Error("Cycle not found");
    if (cycle.status !== CycleStatus.PENDING) {
      throw new Error(
        `Cannot open cycle — current status is ${cycle.status}. Only PENDING cycles can be opened.`
      );
    }

    const updated = await prisma.investmentCycle.update({
      where: { id: cycleId },
      data:  { status: CycleStatus.OPEN_FOR_INVESTMENT },
    });

    return serializeBigInts(updated);
  }

  /**
   * OPEN_FOR_INVESTMENT → ACTIVE
   * Closes the investment window. No more share purchases allowed.
   * Guard: cycle must have at least one investor.
   */
  static async activateCycle(cycleId: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where:   { id: cycleId },
      include: { investments: { select: { id: true } } },
    });

    if (!cycle) throw new Error("Cycle not found");

    if (cycle.status !== CycleStatus.OPEN_FOR_INVESTMENT) {
      throw new Error(
        `Cannot activate cycle — current status is ${cycle.status}.`
      );
    }

    if (cycle.investments.length === 0) {
      throw new Error("Cannot activate a cycle with no investors.");
    }

    const updated = await prisma.investmentCycle.update({
      where: { id: cycleId },
      data:  { status: CycleStatus.ACTIVE },
    });

    return serializeBigInts(updated);
  }

  /**
   * ACTIVE → COMPLETED  (the most critical operation in the entire system)
   *
   * Algorithm:
   *  1. Validate state
   *  2. Calculate profit split (investors vs org)
   *  3. For each ShareholderInvestment — calculate proportional profit
   *  4. Credit every member's wallet (capital return + profit) atomically
   *  5. Write immutable Transaction records for every credit
   *  6. Mark cycle COMPLETED and distribution COMPLETED
   *
   * Everything in steps 2-6 runs inside a SINGLE Prisma transaction.
   * If any single wallet credit fails, the entire operation rolls back.
   * This guarantees either EVERYONE gets paid or NOBODY gets paid.
   */
  static async completeCycle(cycleId: string, adminId: string, input: CompleteCycleInput) {
    // ── 1. Pre-flight checks (outside transaction — read-only) ───────────────
    const cycle = await prisma.investmentCycle.findUnique({
      where:   { id: cycleId },
      include: {
        investments: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
    });

    if (!cycle) throw new Error("Cycle not found");

    if (cycle.status !== CycleStatus.ACTIVE) {
      throw new Error(
        `Cannot complete cycle — current status is ${cycle.status}. Only ACTIVE cycles can be completed.`
      );
    }

    if (cycle.profitDistributionStatus === DistributionStatus.COMPLETED) {
      throw new Error("Profit has already been distributed for this cycle.");
    }

    if (cycle.investments.length === 0) {
      throw new Error("No investors found for this cycle.");
    }

    const totalProfit  = cycle.totalProfitRealizedKobo;
    const totalShares  = cycle.investments.reduce(
      (sum, inv) => sum + inv.sharesAllocated,
      0n
    );

    if (totalShares === 0n) throw new Error("Total shares allocated is zero.");

    // ── 2. Profit split calculation ──────────────────────────────────────────
    // investorProfitPercent is validated 0-100 by zod
    const investorPoolKobo = (totalProfit * BigInt(Math.round(input.investorProfitPercent))) / 100n;
    const orgShareKobo     = totalProfit - investorPoolKobo;

    // ── 3. Per-investor credit calculation (done before the transaction) ─────
    // Calculate outside the DB transaction to keep it as short as possible.
    const payouts = cycle.investments.map((inv) => {
      // Proportional share: (investorShares / totalShares) × pool
      // Use BigInt arithmetic throughout — no floating point ever touches money
      const profitShare = (investorPoolKobo * inv.sharesAllocated) / totalShares;
      return {
        userId:      inv.userId,
        investmentId: inv.id,
        capitalKobo: inv.amountInvestedKobo,  // return what they put in
        profitKobo:  profitShare,              // their cut of the pool
        totalKobo:   inv.amountInvestedKobo + profitShare,
      };
    });

    // ── 4. Atomic execution ──────────────────────────────────────────────────
    await prisma.$transaction(
      async (tx) => {
        // Re-check status inside transaction to prevent race conditions
        const lockedCycle = await tx.investmentCycle.findUnique({
          where:  { id: cycleId },
          select: { status: true, profitDistributionStatus: true },
        });

        if (
          lockedCycle?.status !== CycleStatus.ACTIVE ||
          lockedCycle?.profitDistributionStatus === DistributionStatus.COMPLETED
        ) {
          throw new Error("Cycle state changed — concurrent completion detected. Aborting.");
        }

        for (const payout of payouts) {
          // Credit wallet
          await tx.wallet.upsert({
            where:  { userId: payout.userId },
            create: {
              userId:           payout.userId,
              balanceKobo:      payout.totalKobo,
              lockedBalanceKobo: 0n,
            },
            update: {
              balanceKobo: { increment: payout.totalKobo },
            },
          });

          // Immutable ledger: capital return
          await tx.transaction.create({
            data: {
              userId:            payout.userId,
              transactionType:   TransactionType.CAPITAL_RETURN,
              amountKobo:        payout.capitalKobo,
              transactionStatus: TransactionStatus.COMPLETED,
              narration:         `Capital return — ${cycle.cycleName}`,
              relatedEntityType: "INVESTMENT_CYCLE",
              relatedEntityId:   cycleId,
            },
          });

          // Immutable ledger: profit distribution
          if (payout.profitKobo > 0n) {
            await tx.transaction.create({
              data: {
                userId:            payout.userId,
                transactionType:   TransactionType.PROFIT_DISTRIBUTION,
                amountKobo:        payout.profitKobo,
                transactionStatus: TransactionStatus.COMPLETED,
                narration:         `Profit distribution — ${cycle.cycleName}`,
                relatedEntityType: "INVESTMENT_CYCLE",
                relatedEntityId:   cycleId,
              },
            });
          }

          // Update investment record with profit earned (audit trail)
          await tx.shareholderInvestment.update({
            where: { id: payout.investmentId },
            data:  { profitEarnedKobo: payout.profitKobo },
          });
        }

        // Seal the cycle
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
      {
        // Increase timeout for large member sets — default 5s is too short
        timeout: 30_000,
        // SERIALIZABLE prevents phantom reads during concurrent completions
        isolationLevel: "Serializable",
      }
    );

    return {
      cycleId,
      totalProfitKobo:    totalProfit.toString(),
      investorPoolKobo:   investorPoolKobo.toString(),
      orgShareKobo:       orgShareKobo.toString(),
      investorsPaid:      payouts.length,
      totalSharesInCycle: totalShares.toString(),
    };
  }

  // ============================================================
  // MEMBER — SHARE PURCHASE
  // ============================================================

  /**
   * Purchase shares in an OPEN_FOR_INVESTMENT cycle.
   *
   * Security checks:
   *  - Cycle must be OPEN_FOR_INVESTMENT
   *  - Member must have sufficient wallet balance
   *  - One ShareholderInvestment per user per cycle (upsert adds to existing)
   *  - Idempotency key prevents double-purchases from double-clicks
   *
   * Atomically:
   *  1. Deduct wallet balance
   *  2. Create/update ShareholderInvestment
   *  3. Write SHARE_PURCHASE transaction
   */
  static async purchaseShares(
    userId:         string,
    cycleId:        string,
    quantity:       number,
    idempotencyKey: string
  ) {
    return await prisma.$transaction(
      async (tx) => {
        // ── Idempotency ────────────────────────────────────────────────────
        const existingKey = await tx.idempotencyKey.findUnique({
          where: { key: idempotencyKey },
        });
        if (existingKey) throw new Error("Duplicate request detected");

        await tx.idempotencyKey.create({
          data: {
            key:           idempotencyKey,
            userId,
            requestMethod: "POST",
            requestPath:   "/cycles/shares/purchase",
          },
        });

        // ── Cycle guard ────────────────────────────────────────────────────
        const cycle = await tx.investmentCycle.findUnique({
          where:  { id: cycleId },
          select: { id: true, status: true, pricePerShareKobo: true, cycleName: true },
        });

        if (!cycle) throw new Error("Cycle not found");

        if (cycle.status !== CycleStatus.OPEN_FOR_INVESTMENT) {
          throw new Error(
            `This cycle is not open for investment — status is ${cycle.status}`
          );
        }

        // ── Cost calculation ───────────────────────────────────────────────
        const qty        = BigInt(quantity);
        const totalCost  = cycle.pricePerShareKobo * qty;

        // ── Wallet balance check ───────────────────────────────────────────
        const wallet = await tx.wallet.findUnique({ where: { userId } });

        if (!wallet) throw new Error("Wallet not found. Please fund your account first.");
        if (wallet.balanceKobo < totalCost) {
          throw new Error(
            `Insufficient funds. Required: ₦${(Number(totalCost) / 100).toLocaleString()}, ` +
            `Available: ₦${(Number(wallet.balanceKobo) / 100).toLocaleString()}`
          );
        }

        // ── 1. Deduct wallet ───────────────────────────────────────────────
        await tx.wallet.update({
          where: { userId },
          data:  { balanceKobo: { decrement: totalCost } },
        });

        // ── 2. Upsert ShareholderInvestment ────────────────────────────────
        // If member buys more shares in the same cycle later, we add to existing
        const existing = await tx.shareholderInvestment.findUnique({
          where: { userId_cycleId: { userId, cycleId } },
        });

        let investment;
        if (existing) {
          investment = await tx.shareholderInvestment.update({
            where: { userId_cycleId: { userId, cycleId } },
            data: {
              sharesAllocated:    { increment: qty },
              amountInvestedKobo: { increment: totalCost },
            },
          });
        } else {
          investment = await tx.shareholderInvestment.create({
            data: {
              userId,
              cycleId,
              sharesAllocated:    qty,
              amountInvestedKobo: totalCost,
            },
          });
        }

        // ── 3. Immutable ledger entry ──────────────────────────────────────
        await tx.transaction.create({
          data: {
            userId,
            transactionType:   TransactionType.SHARE_PURCHASE,
            amountKobo:        totalCost,
            transactionStatus: TransactionStatus.COMPLETED,
            narration:         `${quantity} share(s) purchased in ${cycle.cycleName}`,
            relatedEntityType: "INVESTMENT_CYCLE",
            relatedEntityId:   cycleId,
          },
        });

        return serializeBigInts({
          investmentId:       investment.id,
          sharesAllocated:    investment.sharesAllocated,
          amountInvestedKobo: investment.amountInvestedKobo,
          pricePerShareKobo:  cycle.pricePerShareKobo,
          totalCostKobo:      totalCost,
        });
      },
      { isolationLevel: "Serializable" }
    );
  }

  // ============================================================
  // ADMIN — BUSINESS VENTURES
  // ============================================================

  /**
   * Register a business venture that capital from this cycle is deployed into.
   * Can only be created when the cycle is ACTIVE.
   */
  static async createVenture(cycleId: string, input: CreateVentureInput) {
    const cycle = await prisma.investmentCycle.findUnique({
      where:  { id: cycleId },
      select: { status: true },
    });

    if (!cycle) throw new Error("Cycle not found");
    if (cycle.status !== CycleStatus.ACTIVE) {
      throw new Error("Ventures can only be added to ACTIVE cycles.");
    }

    const venture = await prisma.businessVenture.create({
      data: {
        cycleId,
        managedById:         input.managedById,
        companyName:         input.companyName,
        allocatedAmountKobo: toKobo(input.allocatedAmountNaira),
        expectedProfitKobo:  toKobo(input.expectedProfitNaira),
        profitRealizedKobo:  0n,
      },
    });

    return serializeBigInts(venture);
  }

  /**
   * Record realized profit from a venture.
   * Updates both the venture record and the parent cycle's total.
   * Atomic — both update or neither does.
   */
  static async recordVentureProfit(ventureId: string, profitRealizedNaira: number) {
    const profitKobo = toKobo(profitRealizedNaira);

    return await prisma.$transaction(async (tx) => {
      const venture = await tx.businessVenture.findUnique({
        where: { id: ventureId },
        include: { cycle: { select: { status: true, id: true } } },
      });

      if (!venture) throw new Error("Business venture not found");
      if (venture.cycle.status !== CycleStatus.ACTIVE) {
        throw new Error("Profit can only be recorded on ventures in ACTIVE cycles.");
      }

      // Update venture realized profit
      const updatedVenture = await tx.businessVenture.update({
        where: { id: ventureId },
        data:  { profitRealizedKobo: profitKobo },
      });

      // Recalculate total profit across ALL ventures for this cycle
      // This keeps InvestmentCycle.totalProfitRealizedKobo always accurate
      const allVentures = await tx.businessVenture.findMany({
        where:  { cycleId: venture.cycleId },
        select: { profitRealizedKobo: true },
      });

      const totalProfit = allVentures.reduce(
        (sum, v) => sum + v.profitRealizedKobo,
        0n
      );

      await tx.investmentCycle.update({
        where: { id: venture.cycleId },
        data:  { totalProfitRealizedKobo: totalProfit },
      });

      return serializeBigInts({
        ventureId:          updatedVenture.id,
        profitRealizedKobo: updatedVenture.profitRealizedKobo,
        cycleTotalProfitKobo: totalProfit,
      });
    });
  }

  // ============================================================
  // ADMIN — LEDGER
  // ============================================================

  /**
   * Record an organizational income or expense entry.
   * These are for committee bookkeeping — separate from member wallet transactions.
   */
  static async recordLedgerEntry(recordedById: string, input: RecordLedgerEntryInput) {
    if (input.relatedCycleId) {
      const cycle = await prisma.investmentCycle.findUnique({
        where:  { id: input.relatedCycleId },
        select: { id: true },
      });
      if (!cycle) throw new Error("Related cycle not found");
    }

    const entry = await prisma.organizationalLedger.create({
      data: {
        entryType:      input.entryType as LedgerEntryType,
        source:         input.source,
        amountKobo:     toKobo(input.amountNaira),
        date:           new Date(input.date),
        relatedCycleId: input.relatedCycleId ?? null,
        recordedById,
      },
    });

    return serializeBigInts(entry);
  }

  // ============================================================
  // QUERIES (READ-ONLY)
  // ============================================================

  /** List all cycles — paginated, latest first */
  static async listCycles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [cycles, total] = await prisma.$transaction([
      prisma.investmentCycle.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id:               true,
          cycleName:        true,
          status:           true,
          pricePerShareKobo: true,
          startDate:        true,
          endDate:          true,
          description:      true,
          totalProfitRealizedKobo: true,
          profitDistributionStatus: true,
          createdAt:        true,
          _count: {
            select: { investments: true, businessVentures: true },
          },
        },
      }),
      prisma.investmentCycle.count(),
    ]);

    return {
      data:  serializeBigInts(cycles),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Full cycle detail — includes investments, ventures, ledger entries */
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
        },
        businessVentures: {
          include: {
            managedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        organizationalLedgers: {
          include: {
            recordedBy: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!cycle) throw new Error("Cycle not found");

    return serializeBigInts(cycle);
  }

  /** A member's own investment position in a specific cycle */
  static async getMemberPosition(userId: string, cycleId: string) {
    const [investment, cycle] = await prisma.$transaction([
      prisma.shareholderInvestment.findUnique({
        where: { userId_cycleId: { userId, cycleId } },
      }),
      prisma.investmentCycle.findUnique({
        where:  { id: cycleId },
        select: { pricePerShareKobo: true, cycleName: true, status: true },
      }),
    ]);

    if (!cycle) throw new Error("Cycle not found");

    return serializeBigInts({
      invested: investment ?? null,
      cycle,
    });
  }

  /** All cycles a member has invested in */
  static async getMemberInvestmentHistory(userId: string) {
    const investments = await prisma.shareholderInvestment.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      include: {
        cycle: {
          select: {
            id:        true,
            cycleName: true,
            status:    true,
            startDate: true,
            endDate:   true,
            profitDistributionStatus: true,
          },
        },
      },
    });

    return serializeBigInts(investments);
  }
}