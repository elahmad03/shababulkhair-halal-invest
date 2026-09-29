import { z } from "zod";

const MINIMUM_DEPOSIT_NGN = 10_000;

export const initializeDepositSchema = z.object({
  amountNaira: z.number()
    .min(MINIMUM_DEPOSIT_NGN, `Minimum deposit is ₦${MINIMUM_DEPOSIT_NGN}`),
});

export const withdrawSchema = z.object({
  amountKobo: z.number()
    .int("Amount must be a whole number (in kobo)")
    .positive("Amount must be greater than zero"),
  disbursementType: z.enum(["WALLET_BALANCE", "PROFIT_ONLY", "FULL_DIVESTMENT"]),
  // Replaced hardcoded bank fields with the new relational ID
  bankAccountId: z.string().min(1, "Please select a bank account"), 
});

export const adminAdjustSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  amountKobo: z.number()
    .int("Amount must be a whole number (in kobo)")
    .refine(n => n !== 0, "Amount cannot be zero"),
  narration: z.string().min(1, "Narration is required"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),
});

export const listWithdrawalsSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "TRANSFERRED", "COMPLETED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),
});

export const resolveWithdrawalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional(),
}).refine((data) => {
  if (data.status === "REJECTED" && (!data.adminNotes || data.adminNotes.trim() === "")) {
    return false;
  }
  return true;
}, { 
  message: "Admin notes are required when rejecting a withdrawal",
  path: ["adminNotes"]
});

export type InitializeDepositInput = z.infer<typeof initializeDepositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type AdminAdjustInput = z.infer<typeof adminAdjustSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ListWithdrawalsInput = z.infer<typeof listWithdrawalsSchema>;
export type ResolveWithdrawalInput = z.infer<typeof resolveWithdrawalSchema>;