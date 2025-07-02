import { Request, Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth";
import { MonnifyService } from "../services/monnify";
import { PaystackService } from "../services/paystack.service";

// Helper: extract userId safely
const getUserId = (req: AuthRequest): string => {
  const userId = req.user?.userId;
  if (!userId) throw new Error("User not authenticated");
  return userId;
};

// Helper: unified error handling
const handleError = (res: Response, error: unknown, location: string, status = 500): void => {
  console.error(`[${location}] Error:`, error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(status).json({
    success: false,
    message: "An error occurred",
    location,
    details: message,
  });
};

// ✅ Get Wallet Balance
export const getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      res.status(404).json({ message: "Wallet not found" });
      return;
    }

    res.json({ balance: wallet.balance, tier: wallet.tier });
  } catch (err) {
    handleError(res, err, "getWalletBalance");
  }
};

// ✅ Get Crypto Wallet
export const getCryptoWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const cryptoWallet = await prisma.cryptoWallet.findUnique({ where: { userId } });

    if (!cryptoWallet) {
      res.status(404).json({ message: "Crypto Wallet not found" });
      return;
    }

    res.json({ address: cryptoWallet.address, network: cryptoWallet.network });
  } catch (err) {
    handleError(res, err, "getCryptoWallet");
  }
};

// ✅ Get Full Wallet Info
export const getFullWalletInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      res.status(404).json({ message: "Wallet not found" });
      return;
    }

    res.json(wallet);
  } catch (err) {
    handleError(res, err, "getFullWalletInfo");
  }
};

// ✅ Initialize Monnify Funding
export const initializeMonnifyFunding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      res.status(400).json({ message: "Valid amount is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const response = await MonnifyService.initializeTransaction(userId, Number(amount), user.email);

    res.json({
      checkoutUrl: response.checkoutUrl,
      paymentReference: response.reference,
    });
  } catch (err) {
    handleError(res, err, "initializeMonnifyFunding");
  }
};

// ✅ Verify Monnify Funding
export const verifyMonnifyFunding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;
    if (!reference) {
      res.status(400).json({ message: "Reference is required" });
      return;
    }

    const verified = await MonnifyService.verifyTransaction(reference);
    await prisma.wallet.findUnique({ where: { userId: verified.userId } });

    res.json({
      success: true,
      message: "Transaction verified",
      transaction: {
        reference,
        amount: verified.amount,
        status: "SUCCESS",
        type: "CREDIT",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    handleError(res, err, "verifyMonnifyFunding");
  }
};

// ✅ Initialize Paystack Funding
export const initializePaystackFunding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      res.status(400).json({ message: "Valid amount is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const response = await PaystackService.initializeTransaction(userId, Number(amount), user.email);

    res.json({
      checkoutUrl: response.authorization_url,
      paymentReference: response.reference,
    });
  } catch (err) {
    handleError(res, err, "initializePaystackFunding");
  }
};

// ✅ Verify Paystack Funding
export const verifyPaystackFunding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;
    if (!reference) {
      res.status(400).json({ message: "Reference is required" });
      return;
    }

    const verified = await PaystackService.verifyTransaction(reference);
    await prisma.wallet.findUnique({ where: { userId: verified.userId } });

    res.json({
      success: true,
      message: "Transaction verified",
      transaction: {
        reference,
        amount: verified.amount,
        status: "SUCCESS",
        type: "CREDIT",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    handleError(res, err, "verifyPaystackFunding");
  }
};

// ✅ Debug Wallet Transactions
export const debugWalletTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const txs = await prisma.walletTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
    res.json(txs);
  } catch (err) {
    handleError(res, err, "debugWalletTransactions");
  }
};

// ✅ Debug Wallets
export const debugWallets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const wallets = await prisma.wallet.findMany();
    res.json(wallets);
  } catch (err) {
    handleError(res, err, "debugWallets");
  }
};
