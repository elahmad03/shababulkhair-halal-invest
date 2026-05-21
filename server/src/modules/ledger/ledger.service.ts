import { TransactionType, TransactionStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";

// ── Helpers ───────────────────────────────────────────────────────────────────

function serializeBigInts<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LedgerFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// LEDGER SERVICE
// =============================================================================

export default class LedgerService {

  static async getMemberLedger(userId: string, filters: LedgerFilters) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.type) where.transactionType = filters.type;
    if (filters.status) where.transactionStatus = filters.status;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          transactionRef: true,
          transactionType: true,
          amountKobo: true,
          transactionStatus: true,
          narration: true,
          relatedEntityType: true,
          relatedEntityId: true,
          createdAt: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: serializeBigInts(transactions),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getMemberSummary(userId: string) {
    const [wallet, allTransactions] = await prisma.$transaction([
      prisma.wallet.findUnique({
        where: { userId },
        select: { balanceKobo: true, lockedBalanceKobo: true },
      }),
      prisma.transaction.findMany({
        where: { userId, transactionStatus: TransactionStatus.COMPLETED },
        select: { transactionType: true, amountKobo: true },
      }),
    ]);

    const totals = {
      totalDepositedKobo: 0n,
      totalWithdrawnKobo: 0n,
      totalSharesPurchasedKobo: 0n,
      totalCapitalReturnedKobo: 0n,
      totalProfitReceivedKobo: 0n,
      totalEmergencyWithdrawnKobo: 0n,
    };

    for (const tx of allTransactions) {
      switch (tx.transactionType) {
        case TransactionType.DEPOSIT:
          totals.totalDepositedKobo += tx.amountKobo;
          break;
        case TransactionType.WITHDRAWAL:
          totals.totalWithdrawnKobo += tx.amountKobo;
          break;
        case TransactionType.SHARE_PURCHASE:
          totals.totalSharesPurchasedKobo += tx.amountKobo;
          break;
        case TransactionType.CAPITAL_RETURN:
          totals.totalCapitalReturnedKobo += tx.amountKobo;
          break;
        case TransactionType.PROFIT_DISTRIBUTION:
          totals.totalProfitReceivedKobo += tx.amountKobo;
          break;
        case TransactionType.EMERGENCY_WITHDRAWAL:
          totals.totalEmergencyWithdrawnKobo += tx.amountKobo;
          break;
      }
    }

    return serializeBigInts({
      wallet: {
        balanceKobo: wallet?.balanceKobo ?? 0n,
        lockedBalanceKobo: wallet?.lockedBalanceKobo ?? 0n,
      },
      totals,
    });
  }

  static async getTransactionById(userId: string, transactionId: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        transactionRef: true,
        transactionType: true,
        amountKobo: true,
        transactionStatus: true,
        narration: true,
        relatedEntityType: true,
        relatedEntityId: true,
        createdAt: true,
        userId: true,
      },
    });

    if (!tx || tx.userId !== userId) {
      throw new Error("Transaction not found");
    }

    return serializeBigInts(tx);
  }

  // ── ADMIN LEDGER ───────────────────────────────────────────────────────────

  static async getOrgLedger(filters: {
    cycleId?: string;
    entryType?: "INCOME" | "EXPENSE";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.cycleId) where.relatedCycleId = filters.cycleId;
    if (filters.entryType) where.entryType = filters.entryType;

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const [entries, total] = await prisma.$transaction([
      prisma.organizationalLedger.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          recordedBy: { select: { id: true, firstName: true, lastName: true } },
          cycle: { select: { id: true, cycleName: true } },
        },
      }),
      prisma.organizationalLedger.count({ where }),
    ]);

    const allEntries = await prisma.organizationalLedger.findMany({
      where,
      select: { entryType: true, amountKobo: true },
    });

    const totalIncomeKobo = allEntries
      .filter(e => e.entryType === "INCOME")
      .reduce((s, e) => s + e.amountKobo, 0n);

    const totalExpenseKobo = allEntries
      .filter(e => e.entryType === "EXPENSE")
      .reduce((s, e) => s + e.amountKobo, 0n);

    return {
      data: serializeBigInts(entries),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: serializeBigInts({
        totalIncomeKobo,
        totalExpenseKobo,
        netKobo: totalIncomeKobo - totalExpenseKobo,
      }),
    };
  }

  // ── FIXED PART ONLY ────────────────────────────────────────────────────────

  static async recordOrgEntry(
    recordedById: string,
    input: {
      entryType: "INCOME" | "EXPENSE";
      source: string;
      amountNaira: number;
      date: string;
      relatedCycleId?: string;
    }
  ) {
    if (input.relatedCycleId) {
      const cycle = await prisma.investmentCycle.findUnique({
        where: { id: input.relatedCycleId },
        select: { id: true },
      });
      if (!cycle) throw new Error("Related cycle not found");
    }

    const amount = BigInt(Math.round(input.amountNaira * 100));

    // 🔥 FIX: compute running balance
    const lastEntry = await prisma.organizationalLedger.findFirst({
      orderBy: { date: "desc" },
      select: { runningBalanceKobo: true },
    });

    const previousBalance = lastEntry?.runningBalanceKobo ?? 0n;

    const newBalance =
      input.entryType === "INCOME"
        ? previousBalance + amount
        : previousBalance - amount;

    const entry = await prisma.organizationalLedger.create({
      data: {
        entryType: input.entryType as any,
        source: input.source,
        amountKobo: amount,
        runningBalanceKobo: newBalance, // ✅ FIX APPLIED
        date: new Date(input.date),
        relatedCycleId: input.relatedCycleId ?? null,
        recordedById,
      },
      include: {
        recordedBy: { select: { id: true, firstName: true, lastName: true } },
        cycle: { select: { id: true, cycleName: true } },
      },
    });

    return serializeBigInts(entry);
  }
}