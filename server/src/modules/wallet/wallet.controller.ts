import { Request, Response } from "express";
import WalletService from "./wallet.service";
import { 
  initializeDepositSchema, 
  withdrawSchema, 
  adminAdjustSchema,
  paginationSchema,
  listWithdrawalsSchema,
  resolveWithdrawalSchema 
} from "./wallet.validation";
import { catchAsync } from "../../utils/catchAsync";
import { errorResponse, successResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";

export const getWalletSummary = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const summary = await WalletService.getWalletSummary(userId);
  res.status(200).json(successResponse(summary, "Wallet summary retrieved successfully"));
});

// GET /api/wallet/me - Get authenticated user's wallet
export const getMyWallet = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const wallet = await WalletService.getWallet(userId);
  res.status(200).json(successResponse(wallet, "Wallet retrieved successfully"));
});

// GET /api/wallet/admin/:userId - Get user's wallet as admin
export const getAdminWallet = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const wallet = await WalletService.getWallet(userId);
  res.status(200).json(successResponse(wallet, "Wallet retrieved successfully"));
});

export const initializeDeposit = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { amountKobo } = initializeDepositSchema.parse(req.body);
  const userId = req.user!.userId;
  const userEmail = req.user!.email;

  const data = await WalletService.initializeDeposit(userId, amountKobo, userEmail);
  res.status(200).json(successResponse(data, "Deposit initialized successfully"));
});

export const handlePaystackWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["x-paystack-signature"] as string;
  
  await WalletService.processPaymentWebhook(signature, req.body);
  res.status(200).json(successResponse({ received: true }, "Webhook processed"));
});

export const requestWithdrawal = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = withdrawSchema.parse(req.body);
  const userId = req.user!.userId;

  const result = await WalletService.requestWithdrawal(userId, data);
  res.status(200).json(successResponse(result, "Withdrawal request created successfully"));
});

// POST /api/wallet/admin/adjust - Admin manual wallet adjustment
export const adminAdjust = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = adminAdjustSchema.parse(req.body);
  const adminId = req.user!.userId;

  const result = await WalletService.adminAdjust(data.userId, data.amountKobo, data.narration, adminId);
  res.status(200).json(successResponse(result, "Wallet adjusted successfully"));
});

export const resolveWithdrawal = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason } = resolveWithdrawalSchema.parse(req.body);
  const adminId = req.user!.userId;

  const result = await WalletService.resolveWithdrawal(id, adminId, status, rejectionReason);
  res.status(200).json(successResponse(result, `Withdrawal ${status.toLowerCase()} successfully`));
});

// GET /api/wallet/transactions - Get user's transaction history
export const getTransactions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { page, limit } = paginationSchema.parse(req.query);

  const result = await WalletService.getTransactions(userId, page, limit);
  res.status(200).json(successResponse(result, "Transactions retrieved successfully"));
});

// GET /api/wallet/admin/withdrawals - List withdrawal requests with filters
export const listWithdrawals = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { status, page, limit } = listWithdrawalsSchema.parse(req.query);

  const result = await WalletService.listWithdrawals(status, page, limit);
  res.status(200).json(successResponse(result, "Withdrawals retrieved successfully"));
});