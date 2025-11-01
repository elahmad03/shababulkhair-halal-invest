import {
  serial,
  integer,
  text,
  varchar,
  timestamp,
  date,
  pgTable,
  boolean,
  bigint,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ====================================================================================
// SECTION 1: USER, AUTHENTICATION, AND IDENTITY MANAGEMENT
// ====================================================================================

/**
 * ## Users Table
 * The core entity for every person in the system. It manages authentication, roles, and overall account status.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }).unique(),
    role: text("role", { enum: ["member", "committee", "admin"] })
      .default("member")
      .notNull(),
    status: text("status", { enum: ["active", "suspended", "deceased"] })
      .default("active")
      .notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
  })
);

/**
 * ## Verification Tokens Table
 * Stores temporary, single-use tokens for actions like email verification and password resets.
 */
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(), // User's email
  token: text("token").notNull().unique(),   // Hashed token
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * ## User Profiles Table (Revised for Direct URL Storage)
 * Stores all personal and KYC information. All document fields are now simple text fields
 * designed to hold the direct URL from your Cloudinary (or other) cloud storage.
 */
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  streetAddress: text("street_address"),
  city: text("city"),
  state: text("state"),
  country: varchar("country", { length: 100 }),
  dateOfBirth: date("date_of_birth"),
  
  // --- KYC & DOCUMENT FIELDS (REVISED) ---
  kycStatus: text("kyc_status", { enum: ["not_submitted", "pending_review", "verified", "rejected"] }).default("not_submitted").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  governmentIdType: text("government_id_type", { enum: ["national_id", "drivers_license", "passport", "voters_card"] }),
  idCardFrontUrl: text("id_card_front_url"),
  idCardBackUrl: text("id_card_back_url"),

  // --- NEXT OF KIN ---
  nextOfKinName: text("next_of_kin_name").notNull(),
  nextOfKinRelationship: text("next_of_kin_relationship").notNull(),
  nextOfKinPhoneNumber: varchar("next_of_kin_phone_number", { length: 20 }).notNull(),
});

// ====================================================================================
// SECTION 2: CORE FINANCIAL & INVESTMENT INFRASTRUCTURE
// ====================================================================================

/**
 * ## Wallets Table
 * Each user has one wallet, acting as the central hub for all liquid funds.
 * All monetary values are stored as `bigint` representing Kobo for absolute precision.
 */
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  balance: bigint("balance", { mode: "bigint" }).default(0n).notNull(), // Stored as Kobo
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * ## Transactions Table
 * An immutable ledger of every financial movement, providing a complete audit trail.
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["deposit", "share_purchase", "capital_return", "profit_distribution", "withdrawal", "service_payment", "emergency_withdrawal"] }).notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(), // Stored as Kobo
  status: text("status", { enum: ["pending", "completed", "failed"] }).notNull(),
  description: text("description"),
  relatedEntityType: text("related_entity_type", { enum: ["deposit","withdrawal", "investment", "expense_reimbursement", "emergency_request"] }),
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("transactions_user_id_idx").on(table.userId),
}));

/**
 * ## Investment Cycles Table
 * Defines investment periods and explicitly records the 80/20 profit split.
 */
export const investmentCycles = pgTable("investment_cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status", { enum: ["pending", "open_for_investment", "active", "completed"] }).default("pending"),
  pricePerShare: bigint("price_per_share", { mode: "bigint" }).notNull(), // Stored as Kobo
  startDate: date("start_date"),
  endDate: date("end_date"),
  
  // --- PROFIT SPLIT & ACCOUNTING FIELDS ---
  totalProfitRealized: bigint("total_profit_realized", { mode: "bigint" }).default(0n), // Total profit from all ventures in this cycle
  investorProfitPool: bigint("investor_profit_pool", { mode: "bigint" }).default(0n),   // Calculated 80% share for investors
  organizationProfitShare: bigint("organization_profit_share", { mode: "bigint" }).default(0n), // Calculated 20% share for the company
  profitDistributionStatus: text("profit_distribution_status", { enum: ["pending", "completed"] }).default("pending"),
});

/**
 * ## Shareholder Investments Table
 * A record of a user's specific investment in a single cycle.
 */
export const shareholderInvestments = pgTable("shareholder_investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cycleId: integer("cycle_id").notNull().references(() => investmentCycles.id),
  shares: integer("shares").notNull(),
  amountInvested: bigint("amount_invested", { mode: "bigint" }).notNull(), // Stored as Kobo
  profitEarned: bigint("profit_earned", { mode: "bigint" }).default(0n), // Stored as Kobo
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userCycleIdx: uniqueIndex("user_cycle_idx").on(table.userId, table.cycleId),
}));

// ====================================================================================
// SECTION 3: ORGANIZATIONAL & BUSINESS MANAGEMENT
// ====================================================================================

/**
 * ## Organizational Ledger Table
 * The organization's master financial record. This table directly connects the company's profit
 * to each specific cycle
 */
export const organizationalLedger = pgTable("organizational_ledger", {
    id: serial("id").primaryKey(),
    entryType: text("entry_type", { enum: ["income", "expense"] }).notNull(),
    source: text("source").notNull(), // e.g., "Profit Share from August 2025 Cycle", "Office Supplies"
    amount: bigint("amount", { mode: "bigint" }).notNull(), // Stored as Kobo
    date: date("date").notNull(),
    relatedCycleId: integer("related_cycle_id").references(() => investmentCycles.id), // Link income to a cycle
    recordedBy: integer("recorded_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ## Business Ventures Table
 * Records where investment capital from a cycle is allocated.
 */
export const businessVentures = pgTable("business_ventures", {
  id: serial("id").primaryKey(),
  cycleId: integer("cycle_id").notNull().references(() => investmentCycles.id),
  managedBy: integer("managed_by").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  allocatedAmount: bigint("allocated_amount", { mode: "bigint" }).notNull(), // Stored as Kobo
  expectedProfit: bigint("expected_profit", { mode: "bigint" }).notNull(), // Stored as Kobo
  profitRealized: bigint("profit_realized", { mode: "bigint" }).default(0n), // Stored as Kobo
});

// ====================================================================================
// SECTION 4: OPERATIONAL & WORKFLOW MANAGEMENT
// ====================================================================================

/**
 * ## Notifications Table (Engineer's Suggestion)
 * A system to send and track user notifications for important events.
 */
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    link: text("link"), // Optional link to a relevant page (e.g., /wallet)
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ## User Preferences Table
 * Stores user-specific settings.
 */
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  autoReinvest: boolean("auto_reinvest").default(false).notNull(),
});

/**
 * ## Withdrawal Requests Table
 * Manages the standard workflow for user payout requests.
 */
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: bigint("amount", { mode: "bigint" }).notNull(), // Stored as Kobo
  withdrawalType: text("withdrawal_type", { enum: ["wallet_balance", "full_divestment", "profit_only"] }).notNull(),
  relatedCycleId: integer("related_cycle_id").references(() => investmentCycles.id),
  status: text("status", { enum: ["pending", "approved", "processed", "rejected"] }).default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  rejectionReason: text("rejection_reason"),
});

/**
 * ## Emergency Withdrawal Requests 
 * A separate, high-priority queue for users with urgent needs, as seen in your example schema.
 */
export const emergencyWithdrawalRequests = pgTable("emergency_withdrawal_requests", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    reason: text("reason").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(), // Stored as Kobo
    status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
});

/**
 * ## Deceased User Claims Table
 * Manages the sensitive workflow for handling the accounts of deceased users.
 */
export const deceasedUserClaims = pgTable("deceased_user_claims", {
    id: serial("id").primaryKey(),
    deceasedUserId: integer("deceased_user_id").notNull().unique().references(() => users.id),
    claimantName: text("claimant_name").notNull(),
    claimantContact: text("claimant_contact").notNull(),
    status: text("status", { enum: ["pending_review", "documents_requested", "approved_for_payout", "completed", "rejected"] }).default("pending_review").notNull(),
    deathCertificateUrl: text("death_certificate_url"), 
    adminNotes: text("admin_notes"),
    processedBy: integer("processed_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
});