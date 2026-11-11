import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import VentureService from "./venture.service";
import {
  createVentureSchema,
  updateVentureSchema,
  recordProfitSchema,
  uploadReceiptSchema,
  createProfitEntrySchema,
  updateProfitEntrySchema,
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

export const listVentures = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await VentureService.listVentures(page, limit);
  res.status(200).json(successResponse(result, "Ventures list retrieved"));
});

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

export const getVentureInvestors = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await VentureService.getVentureInvestors(id, page, limit);
  res.status(200).json(successResponse(result, "Venture investors retrieved"));
});

// ── Agreement Receipt ─────────────────────────────────────────────────────────

export const uploadAgreementReceipt = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { agreementReceiptUrl } = uploadReceiptSchema.parse(req.body);
  const result = await VentureService.uploadAgreementReceipt(id, req.user!.userId, agreementReceiptUrl);
  res.status(200).json(successResponse(result, "Agreement receipt uploaded successfully"));
});

export const getAgreementReceipt = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await VentureService.getAgreementReceipt(id);
  res.status(200).json(successResponse(result, "Agreement receipt retrieved"));
});

// ── Venture Profit Entries ────────────────────────────────────────────────────

export const createProfitEntry = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const parsed = createProfitEntrySchema.parse(req.body);
  const result = await VentureService.createProfitEntry(id, req.user!.userId, req.user!.role, parsed);
  res.status(201).json(successResponse(result, "Profit entry created successfully"));
});

export const updateProfitEntry = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { entryId } = req.params;
  const parsed = updateProfitEntrySchema.parse(req.body);
  const result = await VentureService.updateProfitEntry(entryId, req.user!.userId, req.user!.role, parsed);
  res.status(200).json(successResponse(result, "Profit entry updated successfully"));
});

export const getProfitEntries = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await VentureService.getProfitEntries(id, req.user!.userId, req.user!.role);
  res.status(200).json(successResponse(result, "Profit entries retrieved"));
});