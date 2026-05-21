import { z } from "zod";

// Minimum deposit: 10,000 NGN = 1,000,000 kobo
const MINIMUM_DEPOSIT_KOBO = 1_000_000;

export const initializeDepositSchema = z.object({
  amountKobo: z.number()
    .int("Amount must be a whole number")
    .min(MINIMUM_DEPOSIT_KOBO, `Minimum deposit is ₦${MINIMUM_DEPOSIT_KOBO / 100_000}`),
});

export const withdrawSchema = z.object({
  amountKobo: z.number()
    .int("Amount must be a whole number")
    .positive("Amount must be greater than zero"),
  disbursementType: z.enum(["WALLET_BALANCE", "PROFIT_ONLY", "FULL_DIVESTMENT"]),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
});

export const adminAdjustSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  amountKobo: z.number().int("Amount must be a whole number").refine(n => n !== 0, "Amount cannot be zero"),
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
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.status === "REJECTED" && !data.rejectionReason) {
    return false;
  }
  return true;
}, { message: "Rejection reason is required when rejecting a withdrawal" });

export type InitializeDepositInput = z.infer<typeof initializeDepositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type AdminAdjustInput = z.infer<typeof adminAdjustSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ListWithdrawalsInput = z.infer<typeof listWithdrawalsSchema>;
export type ResolveWithdrawalInput = z.infer<typeof resolveWithdrawalSchema>;