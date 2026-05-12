import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import UserService from "./user.service";
import { updateUserStatusSchema } from "./user.validators";

// ── List all users ────────────────────────────────────────────────────────────

export const listUsers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, search = "", role = "", status = "", kycStatus = "" } = req.query;
  
  const filters = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10,
    search: (search as string) || undefined,
    role: (role as string) || undefined,
    status: (status as string) || undefined,
    kycStatus: (kycStatus as string) || undefined,
  };

  const result = await UserService.listUsers(filters);
  res.status(200).json(successResponse(result, "Users fetched successfully"));
});

// ── Get user details ──────────────────────────────────────────────────────────

export const getUserDetail = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getUserDetail(id);
  res.status(200).json(successResponse(user, "User details fetched"));
});

// ── Get user KYC ─────────────────────────────────────────────────────────────

export const getUserKyc = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const kyc = await UserService.getUserKyc(id);
  res.status(200).json(successResponse(kyc, "User KYC profile fetched"));
});

// ── Update user status ────────────────────────────────────────────────────────

export const updateUserStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = updateUserStatusSchema.parse(req.body);
  const result = await UserService.updateUserStatus(id, status, req.user!.userId);
  res.status(200).json(successResponse(result, "User status updated"));
});

// ── Get user investments ──────────────────────────────────────────────────────

export const getUserInvestments = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const investments = await UserService.getUserInvestments(id);
  res.status(200).json(successResponse(investments, "User investments fetched"));
});

// ── Get user transactions ─────────────────────────────────────────────────────

export const getUserTransactions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const transactions = await UserService.getUserTransactions(id, {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10,
  });
  res.status(200).json(successResponse(transactions, "User transactions fetched"));
});

// ── Get authenticated user's profile ──────────────────────────────────────────

export const getMe = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await UserService.getUserDetail(userId);
  res.status(200).json(successResponse(user, "User profile retrieved"));
});
