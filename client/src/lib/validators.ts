import { z } from "zod";

// ====================================================================================
// SECTION 1: USER, AUTHENTICATION, AND IDENTITY MANAGEMENT
// ====================================================================================

/**
 * ## User Schema
 * Validates the core user object.
 */
export const UserSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email(),
  passwordHash: z.string(),
  phoneNumber: z.string().nullable(),
  role: z.enum(["member", "committee", "admin"]),
  status: z.enum(["active", "suspended", "deceased"]),
  emailVerified: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

/**
 * ## Verification Token Schema
 * Validates tokens used for email verification, password resets, etc.
 */
export const VerificationTokenSchema = z.object({
  identifier: z.string().email(),
  token: z.string(),
  expires: z.coerce.date(),
});

/**
 * ## User Profile Schema
 * Validates a user's personal and KYC information, including direct Cloudinary URLs.
 */
export const UserProfileSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  streetAddress: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  dateOfBirth: z.coerce.date().nullable(),
  kycStatus: z.enum(["not_submitted", "pending_review", "verified", "rejected"]),
  profilePictureUrl: z.string().url().nullable(),
  governmentIdType: z.enum(["national_id", "drivers_license", "passport", "voters_card"]).nullable(),
  idCardFrontUrl: z.string().url().nullable(),
  idCardBackUrl: z.string().url().nullable(),
  nextOfKinName: z.string().min(3),
  nextOfKinRelationship: z.string().min(2),
  nextOfKinPhoneNumber: z.string().min(5),
});

// ====================================================================================
// SECTION 2: CORE FINANCIAL & INVESTMENT INFRASTRUCTURE
// ====================================================================================

/**
 * ## Wallet Schema
 * Validates a user's wallet. All monetary values use `z.bigint()` for precision.
 */
export const WalletSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  balance: z.bigint().nonnegative(), // Represents Kobo
  updatedAt: z.coerce.date(),
});

/**
 * ## Transaction Schema
 * Validates an entry in the immutable financial ledger.
 */
export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  type: z.enum(["deposit", "share_purchase", "capital_return", "profit_distribution", "withdrawal", "service_payment", "emergency_withdrawal"]),
  amount: z.bigint(), // Represents Kobo
  status: z.enum(["pending", "completed", "failed"]),
  description: z.string().nullable(),
  relatedEntityType: z.enum(["withdrawal", "investment", "expense_reimbursement", "emergency_request"]).nullable(),
  relatedEntityId: z.number().int().positive().nullable(),
  createdAt: z.coerce.date(),
});

/**
 * ## Investment Cycle Schema
 * Validates an investment cycle, including its profit split details.
 */
export const InvestmentCycleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3),
  status: z.enum(["pending", "open_for_investment", "active", "completed"]),
  pricePerShare: z.bigint().positive(), // Represents Kobo
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  totalProfitRealized: z.bigint().nonnegative().default(0n), // Represents Kobo
  investorProfitPool: z.bigint().nonnegative().default(0n),  // Represents Kobo
  organizationProfitShare: z.bigint().nonnegative().default(0n),// Represents Kobo
  profitDistributionStatus: z.enum(["pending", "completed"]),
});

/**
 * ## Shareholder Investment Schema
 * Validates a user's investment in a specific cycle.
 */
export const ShareholderInvestmentSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  cycleId: z.number().int().positive(),
  shares: z.number().int().positive(),
  amountInvested: z.bigint().positive(), // Represents Kobo
  profitEarned: z.bigint().nonnegative().default(0n), // Represents Kobo
  createdAt: z.coerce.date(),
});

// ====================================================================================
// SECTION 3: ORGANIZATIONAL & BUSINESS MANAGEMENT
// ====================================================================================

/**
 * ## Organizational Ledger Schema
 * Validates an entry in the company's master financial record.
 */
export const OrganizationalLedgerSchema = z.object({
    id: z.number().int().positive(),
    entryType: z.enum(["income", "expense"]),
    source: z.string().min(3),
    amount: z.bigint(), // Represents Kobo
    date: z.coerce.date(),
    relatedCycleId: z.number().int().positive().nullable(),
    recordedBy: z.number().int().positive(),
    createdAt: z.coerce.date(),
});

/**
 * ## Business Venture Schema
 * Validates a business where capital has been allocated.
 */
export const BusinessVentureSchema = z.object({
  id: z.number().int().positive(),
  cycleId: z.number().int().positive(),
  managedBy: z.number().int().positive(),
  companyName: z.string().min(3),
  allocatedAmount: z.bigint().positive(), // Represents Kobo
  profitRealized: z.bigint().nonnegative().default(0n), // Represents Kobo
});

// ====================================================================================
// SECTION 4: OPERATIONAL & WORKFLOW MANAGEMENT
// ====================================================================================

/**
 * ## Notification Schema
 * Validates a user notification.
 */
export const NotificationSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    title: z.string().min(3),
    message: z.string().min(5),
    isRead: z.boolean().default(false),
    link: z.string().url().nullable(),
    createdAt: z.coerce.date(),
});

/**
 * ## User Preferences Schema
 * Validates user-specific settings.
 */
export const UserPreferencesSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  autoReinvest: z.boolean().default(false),
});

/**
 * ## Withdrawal Request Schema
 * Validates a standard user payout request.
 */
export const WithdrawalRequestSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  amount: z.bigint().positive(), // Represents Kobo
  withdrawalType: z.enum(["wallet_balance", "full_divestment", "profit_only"]),
  relatedCycleId: z.number().int().positive().nullable(),
  status: z.enum(["pending", "approved", "processed", "rejected"]),
  requestedAt: z.coerce.date(),
  approvedBy: z.number().int().positive().nullable(),
  processedAt: z.coerce.date().nullable(),
  rejectionReason: z.string().nullable(),
});

/**
 * ## Emergency Withdrawal Request Schema
 * Validates a high-priority withdrawal request.
 */
export const EmergencyWithdrawalRequestSchema = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
    amount: z.bigint().positive(), // Represents Kobo
    status: z.enum(["pending", "approved", "rejected"]),
    requestedAt: z.coerce.date(),
    processedAt: z.coerce.date().nullable(),
});

/**
 * ## Deceased User Claim Schema
 * Validates the workflow for handling accounts of deceased users.
 */
export const DeceasedUserClaimSchema = z.object({
    id: z.number().int().positive(),
    deceasedUserId: z.number().int().positive(),
    claimantName: z.string().min(3),
    claimantContact: z.string().min(5),
    status: z.enum(["pending_review", "documents_requested", "approved_for_payout", "completed", "rejected"]),
    deathCertificateUrl: z.string().url().nullable(),
    adminNotes: z.string().nullable(),
    processedBy: z.number().int().positive().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().nullable(),
});