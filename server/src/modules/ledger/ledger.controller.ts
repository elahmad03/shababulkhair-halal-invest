// ── ledger.controller.ts ─────────────────────────────────────────────────────

import { Response } from "express";
import { z } from "zod";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse } from "../../utils/response";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import LedgerService from "./ledger.service";
import { TransactionType, TransactionStatus } from "@prisma/client";

// ── Validators (inline — ledger is simple enough) ────────────────────────────

const ledgerQuerySchema = z.object({
  type:      z.nativeEnum(TransactionType).optional(),
  status:    z.nativeEnum(TransactionStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate:   z.string().datetime().optional(),
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().positive().max(100).default(20),
});

const orgLedgerQuerySchema = z.object({
  cycleId:   z.string().uuid().optional(),
  entryType: z.enum(["INCOME", "EXPENSE"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate:   z.string().datetime().optional(),
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().positive().max(100).default(20),
});

const recordOrgEntrySchema = z.object({
  entryType:       z.enum(["INCOME", "EXPENSE"]),
  source:          z.string().min(2).max(255).trim(),
  amountNaira:     z.number().positive().max(1_000_000_000),
  date:            z.string().datetime(),
  relatedCycleId:  z.string().uuid().optional(),
});

// ── Member controllers ────────────────────────────────────────────────────────

/**
 * GET /ledger
 * Member's own paginated transaction history
 * ?type=DEPOSIT&status=COMPLETED&startDate=...&endDate=...&page=1&limit=20
 */
export const getMemberLedger = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const filters = ledgerQuerySchema.parse(req.query);
  const result  = await LedgerService.getMemberLedger(req.user!.userId, filters);
  res.status(200).json(successResponse(result, "Ledger retrieved"));
});

/**
 * GET /ledger/summary
 * Wallet balance + lifetime totals by category
 */
export const getMemberSummary = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await LedgerService.getMemberSummary(req.user!.userId);
  res.status(200).json(successResponse(result, "Summary retrieved"));
});

/**
 * GET /ledger/transactions/:id
 * Single transaction detail — member can only fetch their own
 */
export const getTransactionById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const tx = await LedgerService.getTransactionById(req.user!.userId, req.params.id);
  res.status(200).json(successResponse(tx, "Transaction retrieved"));
});

// ── Admin controllers ─────────────────────────────────────────────────────────

/**
 * GET /ledger/org
 * Org-level INCOME/EXPENSE entries — admin only
 * ?cycleId=...&entryType=INCOME&startDate=...&endDate=...
 */
export const getOrgLedger = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const filters = orgLedgerQuerySchema.parse(req.query);
  const result  = await LedgerService.getOrgLedger(filters);
  res.status(200).json(successResponse(result, "Org ledger retrieved"));
});

/**
 * POST /ledger/org
 * Record an org income/expense entry
 */
export const recordOrgEntry = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const input = recordOrgEntrySchema.parse(req.body);
  const entry = await LedgerService.recordOrgEntry(req.user!.userId, input);
  res.status(201).json(successResponse(entry, "Ledger entry recorded"));
});