import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import VentureService from "./venture.service";
import {
  createVentureSchema,
  updateVentureSchema,
  recordProfitSchema,
} from "./venture.validators";

// ── Create ────────────────────────────────────────────────────────────────────

export const createVenture = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const input = createVentureSchema.parse(req.body);
  const venture = await VentureService.createVenture(input);
  res.status(201).json(successResponse(venture, "Business venture created successfully"));
});

// ── Update metadata ───────────────────────────────────────────────────────────

export const updateVenture = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateVentureSchema.parse(req.body);
  const venture = await VentureService.updateVenture(id, input);
  res.status(200).json(successResponse(venture, "Venture updated successfully"));
});

// ── Record profit ─────────────────────────────────────────────────────────────

export const recordProfit = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { profitRealizedNaira } = recordProfitSchema.parse(req.body);
  const result = await VentureService.recordProfit(id, profitRealizedNaira);
  res.status(200).json(successResponse(result, "Venture profit recorded"));
});

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteVenture = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await VentureService.deleteVenture(id);
  res.status(200).json(successResponse(result, "Venture deleted successfully"));
});

// ── Queries ───────────────────────────────────────────────────────────────────

export const getVenturesByCycle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { cycleId } = req.params;
  const result = await VentureService.getVenturesByCycle(cycleId);
  res.status(200).json(successResponse(result, "Ventures retrieved"));
});

export const getVentureById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const venture = await VentureService.getVentureById(id);
  res.status(200).json(successResponse(venture, "Venture retrieved"));
});