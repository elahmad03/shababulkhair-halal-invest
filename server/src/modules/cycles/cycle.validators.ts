import { z } from "zod";

// ── Shared ────────────────────────────────────────────────────────────────────

const uuidParam = z.uuid({ error: "Invalid ID format" });

// ── Cycle ─────────────────────────────────────────────────────────────────────

export const createCycleSchema = z.object({
  cycleName: z
    .string()
    .min(3, { error: "Cycle name must be at least 3 characters" })
    .max(100, { error: "Cycle name too long" })
    .trim(),

  pricePerShareNaira: z
    .number({ 
      error: (issue) => issue.input === undefined ? "Price per share is required" : "Price per share must be a number" 
    })
    .positive({ error: "Price per share must be positive" })
    .max(10_000_000, { error: "Price per share too large" }),

  startDate: z
    .iso.datetime({ error: "startDate must be an ISO 8601 datetime string" })
    .optional(),

  endDate: z
    .iso.datetime({ error: "endDate must be an ISO 8601 datetime string" })
    .optional(),

  description: z.string().max(1000).trim().optional(),
});

export const purchaseSharesSchema = z.object({
  cycleId: uuidParam,
  quantity: z
    .number({ 
      error: (issue) => issue.input === undefined ? "Quantity is required" : "Quantity must be a number" 
    })
    .int({ error: "Quantity must be a whole number" })
    .positive({ error: "Quantity must be at least 1" })
    .max(10_000, { error: "Cannot purchase more than 10,000 shares in one transaction" }),
});

export const recordVentureProfitSchema = z.object({
  profitRealizedNaira: z
    .number({ 
      error: (issue) => issue.input === undefined ? "Profit amount is required" : "Profit amount must be a number" 
    })
    .nonnegative({ error: "Profit cannot be negative" })
    .max(1_000_000_000, { error: "Amount too large" }),
});

export const completeCycleSchema = z.object({
  investorProfitPercent: z
    .number()
    .min(0, { error: "Investor profit percent must be >= 0" })
    .max(100, { error: "Investor profit percent must be <= 100" })
    .default(80), // 80% to investors, 20% retained by org
});

// ── Business Venture ──────────────────────────────────────────────────────────

export const createVentureSchema = z.object({
  companyName: z
    .string()
    .min(2, { error: "Company name too short" })
    .max(200, { error: "Company name too long" })
    .trim(),

  allocatedAmountNaira: z
    .number({ 
      error: (issue) => issue.input === undefined ? "Allocated amount is required" : "Allocated amount must be a number" 
    })
    .positive({ error: "Allocated amount must be positive" })
    .max(1_000_000_000, { error: "Allocated amount too large" }),

  expectedProfitNaira: z
    .number({ 
      error: (issue) => issue.input === undefined ? "Expected profit is required" : "Expected profit must be a number" 
    })
    .nonnegative({ error: "Expected profit cannot be negative" })
    .max(1_000_000_000, { error: "Expected profit too large" }),

  managedById: uuidParam,
});

// ── Ledger ────────────────────────────────────────────────────────────────────

export const recordLedgerEntrySchema = z.object({
  entryType: z.enum(["INCOME", "EXPENSE"], {
    error: (issue) => issue.input === undefined 
      ? "Entry type is required" 
      : "Entry type must be INCOME or EXPENSE",
  }),

  source: z
    .string()
    .min(2, { error: "Source description too short" })
    .max(255, { error: "Source description too long" })
    .trim(),

  amountNaira: z
    .number({ 
      error: (issue) => issue.input === undefined ? "Amount is required" : "Amount must be a number" 
    })
    .positive({ error: "Amount must be positive" })
    .max(1_000_000_000, { error: "Amount too large" }),

  date: z.iso.datetime({ error: "date must be an ISO 8601 datetime string" }),

  relatedCycleId: uuidParam.optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type CreateCycleInput         = z.infer<typeof createCycleSchema>;
export type PurchaseSharesInput      = z.infer<typeof purchaseSharesSchema>;
export type RecordVentureProfitInput = z.infer<typeof recordVentureProfitSchema>;
export type CompleteCycleInput       = z.infer<typeof completeCycleSchema>;
export type CreateVentureInput       = z.infer<typeof createVentureSchema>;
export type RecordLedgerEntryInput   = z.infer<typeof recordLedgerEntrySchema>;