import { z } from "zod";

export const uuidParam = z.string().uuid({ message: "Invalid ID format" });

const isoDate = z.string().datetime({ message: "Must be a valid ISO 8601 datetime string" });

// ── Create Cycle ─────────────────────────────────────────────────────────────

export const createCycleSchema = z
  .object({
    cycleName: z
      .string({
        error: (issue) =>
          issue.input === undefined ? "Cycle name is required" : "Cycle name must be a string",
      })
      .min(3, { message: "Cycle name must be at least 3 characters" })
      .max(100, { message: "Cycle name cannot exceed 100 characters" })
      .trim(),

    description: z.string().max(1000, { message: "Description too long" }).trim().optional(),

    pricePerShareNaira: z
      .number()
      .positive({ message: "Price per share must be positive" })
      .max(10_000_000, { message: "Price per share too large" })
      .default(10_000), // Default ₦10,000 = 1,000,000 kobo

    fundingOpensAt: isoDate.optional(),
    fundingClosesAt: isoDate.optional(),
    activeStartsAt: isoDate.optional(),
    activeEndsAt: isoDate.optional(),
  })
  .refine(
    (data) => {
      if (data.fundingOpensAt && data.fundingClosesAt) {
        return new Date(data.fundingOpensAt) < new Date(data.fundingClosesAt);
      }
      return true;
    },
    { message: "Funding close date must be after opening date", path: ["fundingClosesAt"] }
  )
  .refine(
    (data) => {
      if (data.activeStartsAt && data.activeEndsAt) {
        return new Date(data.activeStartsAt) < new Date(data.activeEndsAt);
      }
      return true;
    },
    { message: "Active end date must be after start date", path: ["activeEndsAt"] }
  );

// ── Update Cycle (PENDING only) ───────────────────────────────────────────────

export const updateCycleSchema = z
  .object({
    cycleName: z.string().min(3).max(100).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    
    fundingOpensAt: isoDate.optional(),
    fundingClosesAt: isoDate.optional(),
    activeStartsAt: isoDate.optional(),
    activeEndsAt: isoDate.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// ── Status Transition ────────────────────────────────────────────────────────

export const updateCycleStatusSchema = z.object({
  status: z.enum(
    ["PENDING", "OPEN_FOR_INVESTMENT", "ACTIVE", "CLOSING", "COMPLETED"],
    {
      error: (issue) =>
        issue.input === undefined
          ? "Status is required"
          : "Status must be PENDING, OPEN_FOR_INVESTMENT, ACTIVE, CLOSING, or COMPLETED",
    }
  ),
});

// ── Profit Distribution ──────────────────────────────────────────────────────

export const distributeProfitSchema = z.object({
  investorProfitPercentage: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Investor profit percentage is required"
          : "Investor profit percentage must be a number",
    })
    .min(0, { message: "Investor profit percentage must be >= 0" })
    .max(100, { message: "Investor profit percentage must be <= 100" }),

  notes: z.string().max(500).optional(),
});

// ── Legacy Complete Cycle (for backward compatibility) ─────────────────────────

export const completeCycleSchema = z.object({
  investorProfitPercent: z
    .number()
    .min(0)
    .max(100)
    .default(80),
});

// ── Invest / Purchase Shares ─────────────────────────────────────────────────

export const investSchema = z
  .object({
    sharesRequested: z.number().int().positive().max(10_000).optional(),
    shares: z.number().int().positive().max(10_000).optional(),
    quantity: z.number().int().positive().max(10_000).optional(),
  })
  .refine(
    (data) =>
      data.sharesRequested !== undefined ||
      data.shares !== undefined ||
      data.quantity !== undefined,
    { message: "sharesRequested (or quantity) must be provided and be at least 1" }
  );

// ── Pagination Query ──────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z
    .enum(["PENDING", "OPEN_FOR_INVESTMENT", "ACTIVE", "CLOSING", "COMPLETED"])
    .optional(),
});

// ── Types ────────────────────────────────────────────────────────────────────

export type CreateCycleInput = z.infer<typeof createCycleSchema>;
export type UpdateCycleInput = z.infer<typeof updateCycleSchema>;
export type UpdateCycleStatusInput = z.infer<typeof updateCycleStatusSchema>;
export type DistributeProfitInput = z.infer<typeof distributeProfitSchema>;
export type CompleteCycleInput = z.infer<typeof completeCycleSchema>;
export type InvestInput = z.infer<typeof investSchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;