import { Request, Response } from "express";
import WalletService from "./wallet.service";
import { 
  initializeDepositSchema, 
  requestWithdrawalSchema, 
  resolveWithdrawalSchema 
} from "./wallet.validators";
import { catchAsync } from "../../utils/catchAsync";
import { errorResponse, successResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middlware";

export const getWalletSummary = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const summary = await WalletService.getWalletSummary(userId);
  res.status(200).json(successResponse(summary, "Wallet summary retrieved successfully"));
});

export const initializeDeposit = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { amount } = initializeDepositSchema.parse(req.body);
  const userId = req.user!.userId; // AuthenticatedRequest guarantees this

  const data = await WalletService.initializeDeposit(userId, amount);
  res.status(200).json(successResponse(data, "Deposit initialized successfully"));
});

export const handlePaystackWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["x-paystack-signature"] as string;
  
  // Paystack requires a 200 OK immediately, so we shouldn't await a massive queue here,
  // but for immediate ACID compliance, awaiting the transaction is fine for early-stage.
  await WalletService.processPaymentWebhook(signature, req.body);
  res.status(200).send("OK"); 
});

export const requestWithdrawal = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = requestWithdrawalSchema.parse(req.body);
  const userId = req.user!.userId;

  try {
    const result = await WalletService.requestWithdrawal(
      userId, 
      data.amount, 
      { bankName: data.bankName, accountNumber: data.accountNumber, accountName: data.accountName },
      data.idempotencyKey
    );
    res.status(200).json(successResponse(result, "Withdrawal queued for processing"));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
});

export const resolveWithdrawal = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason } = resolveWithdrawalSchema.parse(req.body);
  const adminId = req.user!.userId;

  try {
    await WalletService.resolveWithdrawal(id, adminId, status, rejectionReason);
    res.status(200).json(successResponse(null, `Withdrawal ${status.toLowerCase()} successfully`));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
});