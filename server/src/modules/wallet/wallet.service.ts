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
  reference: string
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
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
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

    // 2. Call Paystack — if this throws, the PENDING record stays in the DB
    //    which is fine; it will simply never be fulfilled and won't affect the wallet.
    const paystackData = await paystackInitialize(userEmail, amountKobo, transactionRef);

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
   * Idempotent — safe to receive the same webhook event multiple times.
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

    const { reference, status, amount } = payload.data as {
      reference: string;
      status: string;
      amount: number; // Paystack sends this as a number in kobo
    };

    if (status !== "success") return;

    // ── 3. ACID-Compliant State Update ───────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { transactionRef: reference },
      });

      // Guard: unknown reference or already processed (idempotency)
      if (!transaction || transaction.transactionStatus !== TransactionStatus.PENDING) {
        return;
      }

      // Mark transaction complete
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { transactionStatus: TransactionStatus.COMPLETED },
      });

      // Credit wallet — upsert so new users without a wallet row are handled
      await tx.wallet.upsert({
        where: { userId: transaction.userId },
        create: {
          userId: transaction.userId,
          balanceKobo: BigInt(amount),
          lockedBalanceKobo: 0n,
        },
        update: {
          balanceKobo: { increment: BigInt(amount) },
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
    amountNaira: number,
    bankDetails: { bankName: string; accountNumber: string; accountName: string },
    idempotencyKey: string
  ) {
    const amountKobo = BigInt(Math.round(amountNaira * 100));

    return await prisma.$transaction(async (tx) => {
      // 1. Idempotency Check
      const existingKey = await tx.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });
      if (existingKey) throw new Error("Duplicate request detected");

      await tx.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId,
          requestMethod: "POST",
          requestPath: "/wallet/withdraw",
        },
      });

      // 2. Fetch Wallet (Prisma wraps the SELECT in a transaction, giving us row-level isolation)
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet || wallet.balanceKobo < amountKobo) {
        throw new Error("Insufficient funds");
      }

      // 3. Quarantine — atomically move funds from available → locked
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceKobo: { decrement: amountKobo },
          lockedBalanceKobo: { increment: amountKobo },
        },
      });

      // 4. Create Disbursement Request (workflow state)
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

  static async resolveWithdrawal(
    requestId: string,
    adminId: string,
    status: "COMPLETED" | "FAILED",
    reason?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.disbursementRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (!request || request.status !== TransactionStatus.PENDING) {
        throw new Error("Invalid or already processed request");
      }

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
        // Funds leave the system — remove from locked balance only
        await tx.wallet.update({
          where: { userId: request.userId },
          data: { lockedBalanceKobo: { decrement: request.amountKobo } },
        });

        // Immutable ledger entry
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
      } else {
        // FAILED — revert quarantine, return funds to spendable balance
        await tx.wallet.update({
          where: { userId: request.userId },
          data: {
            lockedBalanceKobo: { decrement: request.amountKobo },
            balanceKobo: { increment: request.amountKobo },
          },
        });
      }
    });
  }
}