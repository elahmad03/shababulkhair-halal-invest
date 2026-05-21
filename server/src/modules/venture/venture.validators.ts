import { z } from "zod";

const uuidParam = z.uuid({ error: "Invalid ID format" });

// ── Create ────────────────────────────────────────────────────────────────────

export const createVentureSchema = z.object({
  cycleId: uuidParam,

  companyName: z
    .string()
    .min(2, { error: "Company name must be at least 2 characters" })
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

// ── Update ────────────────────────────────────────────────────────────────────

export const updateVentureSchema = z.object({
  companyName: z
    .string()
    .min(2)
    .max(200)
    .trim()
    .optional(),

  expectedProfitNaira: z
    .number()
    .nonnegative({ error: "Expected profit cannot be negative" })
    .max(1_000_000_000)
    .optional(),

  managedById: uuidParam.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { error: "At least one field must be provided for update" }
);

// ── Record profit ─────────────────────────────────────────────────────────────

export const recordProfitSchema = z.object({
  profitRealizedNaira: z
    .number({ 
      error: (issue) => issue.input === undefined ? "Profit amount is required" : "Profit amount must be a number" 
    })
    .nonnegative({ error: "Profit cannot be negative" })
    .max(1_000_000_000, { error: "Amount too large" }),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type CreateVentureInput  = z.infer<typeof createVentureSchema>;
export type UpdateVentureInput  = z.infer<typeof updateVentureSchema>;
export type RecordProfitInput   = z.infer<typeof recordProfitSchema>;