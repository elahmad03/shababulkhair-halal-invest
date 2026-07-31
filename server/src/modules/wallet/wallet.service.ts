import { TransactionStatus, TransactionType, DisbursementType } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { env } from "../../config";

const PAYSTACK_SECRET_KEY = env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// ==========================================
// PAYSTACK API HELPERS
// ==========================================

/**
 * Typed shape of a successful Paystack initialize response.
 * Paystack wraps every response in { status, message, data }.
 */
interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string; // Redirect the user here
    access_code: string;       // Useful for embedded popup
    reference: string;         // Echo of the reference you sent
  };
}

/**
 * Calls Paystack's /transaction/initialize endpoint.
 * Returns the checkout URL and access code.
 *
 * @param email    - Customer's email (required by Paystack)
 * @param amountKobo - Amount in kobo (Paystack calls this "amount" but it means kobo/pesewas)
 * @param reference  - Your idempotent transaction reference (UUID from DB)
 */
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
      amount: amountKobo.toString(), // Paystack expects a string or number in kobo
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

  /**
   * Step 1 of 2: Creates a PENDING transaction in the DB then calls Paystack
   * to generate a checkout URL. The frontend should redirect the user to
   * `authorizationUrl`. On payment, Paystack calls your webhook (Step 2).
   *
   * @param userId      - Authenticated user's ID
   * @param amountNaira - How much the user wants to deposit (in Naira)
   * @param userEmail   - User's email — required by Paystack for receipts
   */
  static async initializeDeposit(userId: string, amountNaira: number, userEmail: string) {
    const amountKobo = BigInt(Math.round(amountNaira * 100)); // guard against float drift
    const transactionRef = crypto.randomUUID();

    // 1. Persist the pending record FIRST.
    //    This makes the reference available before we even call Paystack,
    //    so a webhook that somehow fires before our response is handled correctly.
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

    // 2. Call Paystack — if this throws, the PENDING record stays in the DB
    //    which is fine; it will simply never be fulfilled and won't affect the wallet.
    const paystackData = await paystackInitialize(userEmail, amountKobo, transactionRef, callbackUrl);

    return {
      transactionRef: transaction.transactionRef,
      amountKobo: transaction.amountKobo.toString(),
      authorizationUrl: paystackData.authorization_url, // Send this to the frontend
      accessCode: paystackData.access_code,             // For Paystack inline popup (optional)
    };
  }

  /**
   * Step 2 of 2: Called by your Express webhook route.
   * Verifies the HMAC-SHA512 signature, then credits the wallet atomically.
   *
   * Idempotent AND concurrency-safe — safe to receive the same webhook event
   * multiple times, including near-simultaneous duplicate deliveries (Paystack
   * retries on non-2xx responses, and duplicates can otherwise race each other).
   */
  static async processPaymentWebhook(signature: string, rawBody: Buffer) {
    // ── 1. Cryptographic Signature Verification ──────────────────────────────
    // CRITICAL: hash must be computed over the RAW request body bytes,
    // NOT over a re-serialised JSON object (field order can differ).
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody) // rawBody is the Buffer from express.raw()
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid webhook signature");
    }

    // ── 2. Parse after verification ──────────────────────────────────────────
    const payload = JSON.parse(rawBody.toString("utf8"));

    // We only handle charge.success; ignore all other Paystack events silently.
    if (payload.event !== "charge.success") return;

    const { reference, status, amount: reportedAmountKobo } = payload.data as {
      reference: string;
      status: string;
      amount: number; // Paystack sends this as a number in kobo — NOT trusted for crediting
    };

    if (status !== "success") return;

    // ── 3. ACID-Compliant, Concurrency-Safe State Update ─────────────────────
    await prisma.$transaction(async (tx) => {
      // Atomically "claim" the transaction: this UPDATE only affects a row
      // that is still PENDING, and Postgres takes a row lock on it. If two
      // webhook deliveries for the same reference race each other, only one
      // will see count === 1; the other sees count === 0 and bails out.
      // This closes the replay/race window without needing extra locking code.
      const claimed = await tx.transaction.updateMany({
        where: {
          transactionRef: reference,
          transactionStatus: TransactionStatus.PENDING,
        },
        data: { transactionStatus: TransactionStatus.COMPLETED },
      });

      // Guard: unknown reference, or already processed/claimed by a
      // concurrent/replayed delivery.
      if (claimed.count === 0) {
        return;
      }

      const transaction = await tx.transaction.findUniqueOrThrow({
        where: { transactionRef: reference },
      });

      // Defense in depth: the amount we credit comes from OUR OWN record
      // (set at initializeDeposit time), never from the webhook payload.
      // If Paystack reports a different amount than we expect, that's a
      // signal worth surfacing rather than silently trusting the payload.
      if (BigInt(reportedAmountKobo) !== transaction.amountKobo) {
        console.warn(
          `Paystack webhook amount mismatch for ref=${reference}: ` +
            `expected=${transaction.amountKobo.toString()} reported=${reportedAmountKobo}`
        );
      }

      // Credit wallet — upsert so new users without a wallet row are handled.
      // Always credit transaction.amountKobo (our source of truth), not the
      // payload's amount field.
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

      // TODO: Fire real-time notification here (e.g. socket.io / Pusher)
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
      bankName: string;
      accountNumber: string;
      accountName: string;
    }
  ) {
    const amountKobo = BigInt(data.amountKobo);

    return await prisma.$transaction(async (tx) => {
      // 1. Get wallet
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet || wallet.balanceKobo < amountKobo) {
        throw new Error("Insufficient funds");
      }

      if (wallet.balanceKobo - amountKobo < 0n) {
        throw new Error("Wallet balance cannot go negative");
      }

      // 2. Quarantine — atomically move funds from available → locked
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceKobo: { decrement: amountKobo },
          lockedBalanceKobo: { increment: amountKobo },
        },
      });

      // 3. Create Disbursement Request (workflow state)
      const request = await tx.disbursementRequest.create({
        data: {
          userId,
          amountKobo,
          disbursementType: data.disbursementType as DisbursementType,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          status: "PENDING",
        },
      });

      return {
        requestId: request.id,
        status: request.status,
        amountKobo: request.amountKobo.toString(),
      };
    });
  }

  /**
   * Resolves a pending withdrawal request (approve/reject).
   *
   * Uses the same atomic-claim pattern as processPaymentWebhook: the status
   * transition itself (PENDING -> APPROVED/REJECTED) is the guard against
   * concurrent double-processing (e.g. two admins clicking "approve" at the
   * same moment, or a duplicate request from a retried client call).
   */
  static async resolveWithdrawal(
    requestId: string,
    adminId: string,
    status: "APPROVED" | "REJECTED",
    reason?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // Atomically claim the request: only succeeds if still PENDING.
      const claimed = await tx.disbursementRequest.updateMany({
        where: {
          id: requestId,
          status: "PENDING",
        },
        data: {
          status: status as any,
          approvedById: adminId,
          processedAt: new Date(),
          rejectionReason: reason || null,
        },
      });

      if (claimed.count === 0) {
        throw new Error("Invalid or already processed request");
      }

      const request = await tx.disbursementRequest.findUniqueOrThrow({
        where: { id: requestId },
      });

      if (status === "APPROVED") {
        // Create transaction to show completion
        await tx.transaction.create({
          data: {
            userId: request.userId,
            transactionType: TransactionType.WITHDRAWAL,
            amountKobo: request.amountKobo,
            transactionStatus: TransactionStatus.COMPLETED,
            narration: `Withdrawal to ${request.bankName} - ${request.accountNumber}`,
            relatedEntityType: "DISBURSEMENT_REQUEST",
            relatedEntityId: request.id,
          },
        });

        // Remove from locked balance (funds have left the system)
        await tx.wallet.update({
          where: { userId: request.userId },
          data: {
            lockedBalanceKobo: { decrement: request.amountKobo },
          },
        });
      } else {
        // REJECTED — revert quarantine, return funds to spendable balance
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

  /**
   * Used by the Next.js /payment/callback page to poll for the outcome
   * of a deposit after Paystack redirects the user back. Does NOT call
   * Paystack again — the webhook (processPaymentWebhook) is the source
   * of truth for crediting; this just reads what our own DB knows.
   *
   * Scoped to userId as well as reference so a user can never poll for
   * (and thus learn the outcome of) another user's transaction.
   */
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
      // Verify user exists
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      // Get wallet
      const wallet = await tx.wallet.upsert({
        where: { userId },
        create: { userId, balanceKobo: 0n, lockedBalanceKobo: 0n },
        update: {},
      });

      const bigAmount = BigInt(amountKobo);

      // If debit, check balance won't go negative
      if (amountKobo < 0) {
        if (wallet.balanceKobo + bigAmount < 0n) {
          throw new Error("Insufficient balance for debit");
        }
      }

      // Update wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          balanceKobo: { increment: bigAmount },
        },
      });

      // Create transaction record
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

  // List withdrawal requests with optional status filter
  static async listWithdrawals(status?: string, page: number = 1, limit: number = 20) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.disbursementRequest.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
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
        bankName: r.bankName,
        accountNumber: r.accountNumber,
        accountName: r.accountName,
        status: r.status,
        rejectionReason: r.rejectionReason,
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