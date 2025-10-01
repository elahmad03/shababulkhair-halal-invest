import { z } from 'zod';

// =======================================
// 1. USER & AUTHENTICATION SCHEMAS
// =======================================

const userRoleEnum = z.enum(['member', 'committee', 'admin']);
const governmentIdTypeEnum = z.enum(['national_id', 'passport', 'drivers_license']);

export const UserSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  passwordHash: z.string().min(64, 'Password hash is required.'), // Simplified for mock, typically longer
  phoneNumber: z.string().regex(/^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone number format.').nullable(),
  role: userRoleEnum.default('member'),
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
  nextOfKinPhoneNumber: z.string().regex(/^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone number format.').nullable(),
});

export const UserPreferencesSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  autoReinvest: z.boolean().default(false),
});

// =======================================
// 2. FINANCIAL & INVESTMENT SCHEMAS
// =======================================

const transactionTypeEnum = z.enum(['deposit', 'share_purchase', 'capital_return', 'profit_distribution', 'withdrawal']);
const transactionStatusEnum = z.enum(['pending', 'completed', 'failed']);
const investmentCycleStatusEnum = z.enum(['pending', 'open_for_investment', 'active', 'completed']);

export const WalletSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  balance: z.string().regex(/^\d+(\.\d{2})?$/, 'Balance must be a currency value.').transform((val) => parseFloat(val)),
  updatedAt: z.date(),
});

export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  type: transactionTypeEnum,
  amount: z.string().regex(/^\d+(\.\d{2})?$/, 'Amount must be a currency value.').transform((val) => parseFloat(val)),
  status: transactionStatusEnum,
  description: z.string().nullable(),
  createdAt: z.date(),
});

export const InvestmentCycleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(5),
  status: investmentCycleStatusEnum.default('pending'),
});

export const ShareholderInvestmentSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  cycleId: z.number().int().positive(),
  shares: z.number().int().positive(),
  amountInvested: z.string().regex(/^\d+(\.\d{2})?$/, 'Amount must be a currency value.').transform((val) => parseFloat(val)),
  profitEarned: z.string().regex(/^\d+(\.\d{2})?$/, 'Profit must be a currency value.').transform((val) => parseFloat(val)).default('0.00'),
});

// =======================================
// 3. ADMIN & ORGANIZATIONAL SCHEMAS
// =======================================

const expenseStatusEnum = z.enum(['paid_by_org', 'pending_reimbursement', 'reimbursed']);
const withdrawalTypeEnum = z.enum(['wallet_balance', 'full_divestment', 'profit_only']);
const withdrawalStatusEnum = z.enum(['pending', 'approved', 'processed', 'rejected']);

export const OrganizationalExpenseSchema = z.object({
  id: z.number().int().positive(),
  description: z.string().min(5),
  amount: z.string().regex(/^\d+(\.\d{2})?$/, 'Amount must be a currency value.').transform((val) => parseFloat(val)),
  date: z.date(),
  contributorId: z.number().int().positive().nullable(),
  status: expenseStatusEnum,
  reimbursementDate: z.date().nullable(),
  recordedBy: z.number().int().positive(),
  createdAt: z.date(),
});

export const WithdrawalRequestSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  amount: z.string().regex(/^\d+(\.\d{2})?$/, 'Amount must be a currency value.').transform((val) => parseFloat(val)),
  withdrawalType: withdrawalTypeEnum,
  relatedCycleId: z.number().int().positive().nullable(),
  status: withdrawalStatusEnum.default('pending'),
  requestedAt: z.date(),
  approvedBy: z.number().int().positive().nullable(),
  processedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
});

// Aggregated Zod Types
export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type WithdrawalRequest = z.infer<typeof WithdrawalRequestSchema>;
// ... add other types as needed