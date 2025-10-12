import { z } from "zod";

// =======================================
// ENUM DEFINITIONS
// =======================================

const userRoleEnum = z.enum(["member", "committee", "admin"]);
const governmentIdTypeEnum = z.enum([
  "national_id",
  "passport",
  "drivers_license",
]);

const transactionTypeEnum = z.enum([
  "deposit",
  "share_purchase",
  "capital_return",
  "profit_distribution",
  "withdrawal",
]);
const transactionStatusEnum = z.enum(["pending", "completed", "failed"]);
const investmentCycleStatusEnum = z.enum([
  "pending",
  "open_for_investment",
  "active",
  "completed",
]);

const expenseStatusEnum = z.enum([
  "paid_by_org",
  "pending_reimbursement",
  "reimbursed",
]);

const reimbursementStatusEnum = z.enum(["pending", "reimbursed"]);

const withdrawalTypeEnum = z.enum([
  "wallet_balance",
  "full_divestment",
  "profit_only",
]);
const withdrawalStatusEnum = z.enum([
  "pending",
  "approved",
  "processed",
  "rejected",
]);

// =======================================
// 1. USER & AUTHENTICATION SCHEMAS
// =======================================

export const UserSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string().min(1),
  phoneNumber: z.string().nullable(),
  role: userRoleEnum.default("member"),
  createdAt: z.date(),
});

export const UserProfileSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  streetAddress: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().max(100).nullable(),
  dateOfBirth: z.date().nullable(),
  governmentIdType: governmentIdTypeEnum.nullable(),
  governmentIdNumber: z.string().max(100).nullable(),
  nextOfKinName: z.string().nullable(),
  nextOfKinRelationship: z.string().nullable(),
  nextOfKinPhoneNumber: z.string().nullable(),
});

export const UserPreferencesSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  autoReinvest: z.boolean().default(false),
});

// =======================================
// 2. FINANCIAL & INVESTMENT SCHEMAS
// =======================================

export const WalletSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  balance: z.number().nonnegative(),
  updatedAt: z.date(),
});

export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  type: transactionTypeEnum,
  amount: z.number().positive(),
  status: transactionStatusEnum,
  description: z.string().nullable(),
  createdAt: z.date(),
});

export const InvestmentCycleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3),
  status: investmentCycleStatusEnum.default("pending"),
});

export const ShareholderInvestmentSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  cycleId: z.number().int().positive(),
  shares: z.number().int().positive(),
  amountInvested: z.number().positive(),
  profitEarned: z.number().nonnegative().default(0),
});

export const BusinessVentureSchema = z.object({
  id: z.number().int().positive(),
  cycleId: z.number().int().positive(),
  managedBy: z.number().int().positive(),
  companyName: z.string().min(3),
  allocatedAmount: z.number().positive(),
  expectedProfit: z.number().positive(),
  profitRealized: z.number().nonnegative().default(0),
});

// =======================================
// 3. ADMIN & ORGANIZATIONAL SCHEMAS
// =======================================

export const OrganizationalExpenseSchema = z.object({
  id: z.number().int().positive(),
  description: z.string().min(5),
  amount: z.number().positive(),
  date: z.date(),
  status: expenseStatusEnum.default("paid_by_org"),
  recordedBy: z.number().int().positive(),
  createdAt: z.date(),
});

export const ExpenseContributionSchema = z.object({
  id: z.number().int().positive(),
  expenseId: z.number().int().positive(),
  userId: z.number().int().positive(),
  amountContributed: z.number().positive(),
  reimbursementStatus: reimbursementStatusEnum.default("pending"),
  reimbursementDate: z.date().nullable(),
});

export const WithdrawalRequestSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  amount: z.number().positive(),
  withdrawalType: withdrawalTypeEnum,
  relatedCycleId: z.number().int().positive().nullable(),
  status: withdrawalStatusEnum.default("pending"),
  requestedAt: z.date(),
  approvedBy: z.number().int().positive().nullable(),
  processedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
});

// =======================================
// TYPE EXPORTS
// =======================================

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type Wallet = z.infer<typeof WalletSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type InvestmentCycle = z.infer<typeof InvestmentCycleSchema>;
export type ShareholderInvestment = z.infer<typeof ShareholderInvestmentSchema>;
export type BusinessVenture = z.infer<typeof BusinessVentureSchema>;
export type OrganizationalExpense = z.infer<typeof OrganizationalExpenseSchema>;
export type ExpenseContribution = z.infer<typeof ExpenseContributionSchema>;
export type WithdrawalRequest = z.infer<typeof WithdrawalRequestSchema>;
