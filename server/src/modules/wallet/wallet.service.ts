import { 
  TransactionStatus, 
  TransactionType, 
  DisbursementType,
  DisbursementStatus
} from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { env } from "../../config";

const PAYSTACK_SECRET_KEY = env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// ==========================================
// PAYSTACK API HELPERS
// ==========================================

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

async function paystackInitialize(
  email: string,
  amountKobo: bigint,
  reference: string,
  callbackUrl: string
): Promise<PaystackInitializeResponse["data"]> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountKobo.toString(),
      reference,
      currency: "NGN",
      callback_url: callbackUrl,
      channels: ["card", "bank", "bank_transfer"],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Paystack initialize failed [${res.status}]: ${errorBody}`);
  }

  const json = (await res.json()) as PaystackInitializeResponse;

  if (!json.status) {
    throw new Error(`Paystack error: ${json.message}`);
  }

  return json.data;
}

// ==========================================
// WALLET SERVICE
// ==========================================

export default class WalletService {
  // ==========================================
  // WALLET RETRIEVAL
  // ==========================================

  static async getWallet(userId: string) {
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      create: { userId, balanceKobo: 0n, lockedBalanceKobo: 0n },
      update: {},
    });

    return {
      balanceKobo: wallet.balanceKobo.toString(),
      lockedBalanceKobo: wallet.lockedBalanceKobo.toString(),
      totalKobo: (wallet.balanceKobo + wallet.lockedBalanceKobo).toString(),
    };
  }

  // ==========================================
  // DASHBOARD SUMMARY
  // ==========================================

  static async getWalletSummary(userId: string) {
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      create: { userId, balanceKobo: 0n, lockedBalanceKobo: 0n },
      update: {},
    });

    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        transactionType: true,
        amountKobo: true,
        transactionStatus: true,
        createdAt: true,
      },
    });

    return {
      balanceKobo: wallet.balanceKobo.toString(),
      lockedBalanceKobo: wallet.lockedBalanceKobo.toString(),
      recentTransactions: recentTransactions.map((tx) => ({
        ...tx,
        amountKobo: tx.amountKobo.toString(),
      })),
    };
  }

  // ==========================================
  // DEPOSIT WORKFLOW
  // ==========================================

  static async initializeDeposit(userId: string, amountNaira: number, userEmail: string) {
    const amountKobo = BigInt(Math.round(amountNaira * 100));
    const transactionRef = crypto.randomUUID();

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        transactionRef,
        transactionType: TransactionType.DEPOSIT,
        amountKobo,
        transactionStatus: TransactionStatus.PENDING,
        narration: "Wallet Deposit Initialization",
      },
    });
    
    const callbackUrl = `${env.CLIENT_ORIGIN}/payment/callback`;

    const paystackData = await paystackInitialize(userEmail, amountKobo, transactionRef, callbackUrl);

    return {
      transactionRef: transaction.transactionRef,
      amountKobo: transaction.amountKobo.toString(),
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
    };
  }

  static async processPaymentWebhook(signature: string, rawBody: Buffer) {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    if (payload.event !== "charge.success") return;

    const { reference, status, amount: reportedAmountKobo } = payload.data as {
      reference: string;
      status: string;
      amount: number;
    };

    if (status !== "success") return;

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.transaction.updateMany({
        where: {
          transactionRef: reference,
          transactionStatus: TransactionStatus.PENDING,
        },
        data: { transactionStatus: TransactionStatus.COMPLETED },
      });

      if (claimed.count === 0) {
        return;
      }

      const transaction = await tx.transaction.findUniqueOrThrow({
        where: { transactionRef: reference },
      });

      if (BigInt(reportedAmountKobo) !== transaction.amountKobo) {
        console.warn(
          `Paystack webhook amount mismatch for ref=${reference}: ` +
            `expected=${transaction.amountKobo.toString()} reported=${reportedAmountKobo}`
        );
      }

      await tx.wallet.upsert({
        where: { userId: transaction.userId },
        create: {
          userId: transaction.userId,
          balanceKobo: transaction.amountKobo,
          lockedBalanceKobo: 0n,
        },
        update: {
          balanceKobo: { increment: transaction.amountKobo },
        },
      });
    });
  }

  // ==========================================
  // WITHDRAWAL WORKFLOW
  // ==========================================

  static async requestWithdrawal(
    userId: string,
    data: {
      amountKobo: number;
      disbursementType: "WALLET_BALANCE" | "PROFIT_ONLY" | "FULL_DIVESTMENT";
      bankAccountId: string;
    }
  ) {
    const amountKobo = BigInt(data.amountKobo);

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet || wallet.balanceKobo < amountKobo) {
        throw new Error("Insufficient funds");
      }

      if (wallet.balanceKobo - amountKobo < 0n) {
        throw new Error("Wallet balance cannot go negative");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceKobo: { decrement: amountKobo },
          lockedBalanceKobo: { increment: amountKobo },
        },
      });

      const request = await tx.disbursementRequest.create({
        data: {
          userId,
          amountKobo,
          disbursementType: data.disbursementType as DisbursementType,
          bankAccountId: data.bankAccountId,
          status: DisbursementStatus.PENDING,
        },
      });

      return {
        requestId: request.id,
        status: request.status,
        amountKobo: request.amountKobo.toString(),
      };
    });
  }

  static async resolveWithdrawal(
    requestId: string,
    adminId: string,
    status: "APPROVED" | "REJECTED",
    adminNotes?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const dbStatus = status === "APPROVED" 
        ? DisbursementStatus.APPROVED 
        : DisbursementStatus.REJECTED;

      const claimed = await tx.disbursementRequest.updateMany({
        where: {
          id: requestId,
          status: DisbursementStatus.PENDING,
        },
        data: {
          status: dbStatus,
          approvedById: adminId,
          processedAt: new Date(),
          adminNote: adminNotes || null,
        },
      });

      if (claimed.count === 0) {
        throw new Error("Invalid or already processed request");
      }

      const request = await tx.disbursementRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: { bankAccount: true } 
      });

      if (status === "APPROVED") {
        await tx.transaction.create({
          data: {
            userId: request.userId,
            transactionType: TransactionType.WITHDRAWAL,
            amountKobo: request.amountKobo,
            transactionStatus: TransactionStatus.COMPLETED,
            narration: `Withdrawal to ${request.bankAccount.bankName} - ${request.bankAccount.accountNumber}`,
            relatedEntityType: "DISBURSEMENT_REQUEST",
            relatedEntityId: request.id,
          },
        });

        await tx.wallet.update({
          where: { userId: request.userId },
          data: {
            lockedBalanceKobo: { decrement: request.amountKobo },
          },
        });
      } else {
        await tx.wallet.update({
          where: { userId: request.userId },
          data: {
            lockedBalanceKobo: { decrement: request.amountKobo },
            balanceKobo: { increment: request.amountKobo },
          },
        });
      }

      return {
        requestId: request.id,
        status: status,
      };
    });
  }

  // ==========================================
  // TRANSACTION HISTORY
  // ==========================================

  static async getTransactions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          transactionRef: true,
          transactionType: true,
          amountKobo: true,
          transactionStatus: true,
          narration: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        ...tx,
        amountKobo: tx.amountKobo.toString(),
      })),
      total,
      page,
      limit,
    };
  }

  // ==========================================
  // TRANSACTION STATUS (for post-payment polling)
  // ==========================================

  static async getTransactionStatus(reference: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { transactionRef: reference, userId },
      select: {
        transactionRef: true,
        transactionType: true,
        amountKobo: true,
        transactionStatus: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return {
      ...transaction,
      amountKobo: transaction.amountKobo.toString(),
    };
  }

  // ==========================================
  // ADMIN OPERATIONS
  // ==========================================

  static async adminAdjust(
    userId: string,
    amountKobo: number,
    narration: string,
    adminId: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      const wallet = await tx.wallet.upsert({
        where: { userId },
        create: { userId, balanceKobo: 0n, lockedBalanceKobo: 0n },
        update: {},
      });

      const bigAmount = BigInt(amountKobo);

      if (amountKobo < 0) {
        if (wallet.balanceKobo + bigAmount < 0n) {
          throw new Error("Insufficient balance for debit");
        }
      }

      await tx.wallet.update({
        where: { userId },
        data: {
          balanceKobo: { increment: bigAmount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          transactionType: amountKobo > 0 ? TransactionType.CAPITAL_RETURN : TransactionType.WITHDRAWAL,
          amountKobo: BigInt(Math.abs(amountKobo)),
          transactionStatus: TransactionStatus.COMPLETED,
          narration,
        },
      });

      return {
        adjusted: true,
        transactionId: transaction.id,
        newBalance: (wallet.balanceKobo + bigAmount).toString(),
      };
    });
  }

  static async listWithdrawals(status?: string, page: number = 1, limit: number = 20) {
    const where: any = {};
    if (status) {
      where.status = status as DisbursementStatus;
    }

    const [requests, total] = await Promise.all([
      prisma.disbursementRequest.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          bankAccount: true,
        },
        orderBy: { requestedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.disbursementRequest.count({ where }),
    ]);

    return {
      data: requests.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        userName: `${r.user.firstName} ${r.user.lastName}`,
        userEmail: r.user.email,
        amountKobo: r.amountKobo.toString(),
        bankName: r.bankAccount?.bankName,
        accountNumber: r.bankAccount?.accountNumber,
        accountName: r.bankAccount?.accountName,
        status: r.status,
        adminNote: r.adminNotes,
        requestedAt: r.requestedAt.toISOString(),
        processedAt: r.processedAt?.toISOString(),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}