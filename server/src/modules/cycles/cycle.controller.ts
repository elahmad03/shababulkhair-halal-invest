import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import CycleService from "./cycle.service";
import {
  createCycleSchema,
  updateCycleSchema,
  updateCycleStatusSchema,
  distributeProfitSchema,
  completeCycleSchema,
  investSchema,
  paginationQuerySchema,
} from "./cycle.validation";

// ── ADMIN CONTROLLERS ─────────────────────────────────────────────────────────

export const createCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const input = createCycleSchema.parse(req.body);
  const cycle = await CycleService.createCycle(input);
  res.status(201).json(successResponse(cycle, "Investment cycle created successfully"));
});

export const updateCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateCycleSchema.parse(req.body);
  const cycle = await CycleService.updateCycle(id, input);
  res.status(200).json(successResponse(cycle, "Cycle details updated"));
});

export const updateCycleStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const input = updateCycleStatusSchema.parse(req.body);
  const result = await CycleService.updateCycleStatus(id, input, adminId);
  res.status(200).json(successResponse(result, `Cycle status updated to ${input.status}`));
});

export const openCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const cycle = await CycleService.openCycle(id);
  res.status(200).json(successResponse(cycle, "Cycle is now open for investment"));
});

export const activateCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const durationDays = req.body?.durationDays ? Number(req.body.durationDays) : 90;
  const cycle = await CycleService.activateCycle(id, durationDays);
  res.status(200).json(successResponse(cycle, "Cycle activated — investment window closed"));
});

export const distributeProfit = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const input = distributeProfitSchema.parse(req.body);
  const result = await CycleService.distributeProfit(id, adminId, input);
  res.status(200).json(successResponse(result, "Profit distributed and recorded"));
});

export const completeCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const input = completeCycleSchema.parse(req.body);
  const result = await CycleService.completeCycle(id, adminId, input);
  res.status(200).json(successResponse(result, "Cycle completed and profits distributed"));
});

export const getCycleInvestments = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const result = await CycleService.getCycleInvestments(id, page, limit);
  res.status(200).json(successResponse(result, "Cycle investments retrieved"));
});

// ── MEMBER CONTROLLERS ───────────────────────────────────────────────────────

export const purchaseShares = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const cycleId = req.params.id || req.body.cycleId;

  if (!cycleId) {
    res.status(400).json(errorResponse("Cycle ID is required"));
    return;
  }

  const parsed = investSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse("Invalid shares quantity", parsed.error.format()));
    return;
  }

  const shares =
    parsed.data.sharesRequested ??
    parsed.data.shares ??
    parsed.data.quantity ??
    1;

  // Idempotency key from client header or generated fallback
  const idempotencyKey =
    (req.headers["idempotency-key"] as string) ||
    req.body.idempotencyKey ||
    `invest-${userId}-${cycleId}-${Date.now()}`;

  const result = await CycleService.purchaseShares(
    userId,
    cycleId,
    shares,
    idempotencyKey
  );

  res.status(200).json(successResponse(result, "Shares purchased successfully"));
});

// ── QUERIES ──────────────────────────────────────────────────────────────────

export const listCycles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = paginationQuerySchema.parse(req.query);
  const result = await CycleService.listCycles(query.page, query.limit, query.status);
  res.status(200).json(successResponse(result, "Cycles retrieved"));
});

export const getCycleById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const cycle = await CycleService.getCycleById(id);
  res.status(200).json(successResponse(cycle, "Cycle retrieved"));
});

export const getMemberPosition = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id: cycleId } = req.params;
  const result = await CycleService.getMemberPosition(userId, cycleId);
  res.status(200).json(successResponse(result, "Member position retrieved"));
});

export const getMemberInvestmentHistory = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const result = await CycleService.getMemberInvestmentHistory(userId);
  res.status(200).json(successResponse(result, "Investment history retrieved"));
});