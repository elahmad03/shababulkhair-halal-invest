import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import CycleService from "./cycle.service";
import {
  createCycleSchema,
  purchaseSharesSchema,
  recordVentureProfitSchema,
  completeCycleSchema,
  createVentureSchema,
  recordLedgerEntrySchema,
} from "./cycle.validators";

// ============================================================
// ADMIN — CYCLE LIFECYCLE
// ============================================================

export const createCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const input = createCycleSchema.parse(req.body);
  const cycle = await CycleService.createCycle(input);
  res.status(201).json(successResponse(cycle, "Investment cycle created successfully"));
});

export const openCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const cycle = await CycleService.openCycle(id);
  res.status(200).json(successResponse(cycle, "Cycle is now open for investment"));
});

export const activateCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const cycle = await CycleService.activateCycle(id);
  res.status(200).json(successResponse(cycle, "Cycle activated — investment window closed"));
});

export const completeCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const input = completeCycleSchema.parse(req.body);
  const result = await CycleService.completeCycle(id, adminId, input);
  res.status(200).json(successResponse(result, "Cycle completed and profits distributed"));
});

// ============================================================
// ADMIN — VENTURES & LEDGER
// ============================================================

// ============================================================
// MEMBER — SHARE PURCHASE
// ============================================================

export const purchaseShares = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { cycleId, quantity } = purchaseSharesSchema.parse(req.body);

  // Idempotency key from client header — prevents double purchases on retry/double-click
  const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
  if (!idempotencyKey) {
    res.status(400).json(errorResponse("Idempotency-Key header is required"));
    return;
  }

  const result = await CycleService.purchaseShares(userId, cycleId, quantity, idempotencyKey);
  res.status(200).json(successResponse(result, "Shares purchased successfully"));
});

// ============================================================
// QUERIES
// ============================================================

export const listCycles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
  const result = await CycleService.listCycles(page, limit);
  res.status(200).json(successResponse(result, "Cycles retrieved"));
});

export const getCycleById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const cycle = await CycleService.getCycleById(id);
  res.status(200).json(successResponse(cycle, "Cycle retrieved"));
});

export const getMemberPosition = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId  = req.user!.userId;
  const { id: cycleId } = req.params;
  const result = await CycleService.getMemberPosition(userId, cycleId);
  res.status(200).json(successResponse(result, "Member position retrieved"));
});

export const getMemberInvestmentHistory = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const result = await CycleService.getMemberInvestmentHistory(userId);
  res.status(200).json(successResponse(result, "Investment history retrieved"));
});