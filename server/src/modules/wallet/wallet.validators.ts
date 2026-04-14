import { z } from "zod";

export const initializeDepositSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});

export const requestWithdrawalSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().length(10, "Invalid account number length"),
  accountName: z.string().min(2, "Account name is required"),
  idempotencyKey: z.string().uuid("Invalid idempotency key format"),
});

export const resolveWithdrawalSchema = z.object({
  status: z.enum(["COMPLETED", "FAILED"]),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.status === "FAILED" && !data.rejectionReason) {
    return false;
  }
  return true;
}, { message: "Rejection reason is required when rejecting a withdrawal" });