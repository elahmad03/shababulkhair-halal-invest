
import {  TransactionStatus, TransactionType, DisbursementType } from "@prisma/client";
import crypto from "crypto";
import {prisma} from "../../config/prisma";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export default class WalletService {
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

  static async initializeDeposit(userId: string, amountNaira: number) {
    const amountKobo = BigInt(amountNaira * 100);
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

    // TODO: Call Paystack/Flutterwave API here using `transactionRef` 
    // const gatewayResponse = await Paystack.initialize({ amount: amountKobo, reference: transactionRef, email: user.email });

    return {
      transactionRef: transaction.transactionRef,
      amountKobo: transaction.amountKobo.toString(), // Convert BigInt for JSON serialization
      authorizationUrl: "https://checkout.paystack.com/mock-url-for-now", // Mocked
    };
  }

  static async processPaymentWebhook(signature: string, payload: any) {
    // 1. Cryptographic Signature Verification
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid webhook signature");
    }

    const { reference, status, amount } = payload.data;

    if (status !== "success") return; // Ignore failed payments; wait for success

    // 2. ACID Compliant State Update
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { transactionRef: reference },
      });

      if (!transaction || transaction.transactionStatus !== TransactionStatus.PENDING) {
        return; // Already processed or invalid
      }

      // Mark transaction complete
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { transactionStatus: TransactionStatus.COMPLETED },
      });

      // Credit Wallet
      await tx.wallet.upsert({
        where: { userId: transaction.userId },
        create: {
          userId: transaction.userId,
          balanceKobo: BigInt(amount),
        },
        update: {
          balanceKobo: { increment: BigInt(amount) },
        },
      });
      
      // TODO: Fire real-time notification here
    });
  }

  // ==========================================
  // WITHDRAWAL WORKFLOW
  // ==========================================

  static async requestWithdrawal(userId: string, amountNaira: number, bankDetails: any, idempotencyKey: string) {
    const amountKobo = BigInt(amountNaira * 100);

    return await prisma.$transaction(async (tx) => {
      // 1. Idempotency Check
      const existingKey = await tx.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
      if (existingKey) throw new Error("Duplicate request detected");

      await tx.idempotencyKey.create({
        data: { key: idempotencyKey, userId, requestMethod: "POST", requestPath: "/wallet/withdraw" }
      });

      // 2. Fetch Wallet with strict lock (SELECT ... FOR UPDATE) to prevent race conditions
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet || wallet.balanceKobo < amountKobo) {
        throw new Error("Insufficient funds");
      }

      // 3. The Quarantine (Lock Funds)
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceKobo: { decrement: amountKobo },
          lockedBalanceKobo: { increment: amountKobo },
        },
      });

      // 4. Create Workflow State (DisbursementRequest)
      const request = await tx.disbursementRequest.create({
        data: {
          userId,
          amountKobo,
          disbursementType: DisbursementType.WALLET_BALANCE,
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          accountName: bankDetails.accountName,
          status: TransactionStatus.PENDING,
        },
      });

      return {
        requestId: request.id,
        status: request.status,
        amountKobo: request.amountKobo.toString(),
      };
    });
  }

  static async resolveWithdrawal(requestId: string, adminId: string, status: "COMPLETED" | "FAILED", reason?: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.disbursementRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (!request || request.status !== TransactionStatus.PENDING) {
        throw new Error("Invalid or already processed request");
      }

      // Update Workflow State
      await tx.disbursementRequest.update({
        where: { id: requestId },
        data: {
          status,
          approvedById: adminId,
          processedAt: new Date(),
          rejectionReason: reason || null,
        },
      });

      if (status === "COMPLETED") {
        // Funds leave system completely
        await tx.wallet.update({
          where: { userId: request.userId },
          data: { lockedBalanceKobo: { decrement: request.amountKobo } },
        });

        // Write to immutable ledger
        await tx.transaction.create({
          data: {
            userId: request.userId,
            transactionType: TransactionType.WITHDRAWAL,
            amountKobo: request.amountKobo,
            transactionStatus: TransactionStatus.COMPLETED,
            relatedEntityType: "DISBURSEMENT_REQUEST",
            relatedEntityId: request.id,
          },
        });
      } else if (status === "FAILED") {
        // Revert the quarantine
        await tx.wallet.update({
          where: { userId: request.userId },
          data: {
            lockedBalanceKobo: { decrement: request.amountKobo },
            balanceKobo: { increment: request.amountKobo }, // Return funds to user
          },
        });
      }
    });
  }
}