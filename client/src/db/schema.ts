import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  bigint,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// ====================================================================================
// NATIVE POSTGRES ENUMS (Bank-Grade Data Integrity)
// ====================================================================================
export const userRoleEnum = pgEnum("user_role", ["member", "committee", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "deceased"]);
export const kycStatusEnum = pgEnum("kyc_status", ["not_submitted", "pending_review", "verified", "rejected"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "share_purchase", "capital_return", "profit_distribution", "withdrawal", "service_payment", "emergency_withdrawal"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);
export const entityTypeEnum = pgEnum("entity_type", ["deposit", "withdrawal", "investment", "expense_reimbursement", "emergency_request"]);
export const cycleStatusEnum = pgEnum("cycle_status", ["pending", "open_for_investment", "active", "completed"]);
export const distributionStatusEnum = pgEnum("distribution_status", ["pending", "completed"]);
export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", ["income", "expense"]);
export const withdrawalTypeEnum = pgEnum("withdrawal_type", ["wallet_balance", "full_divestment", "profit_only"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "processed", "rejected"]);
export const claimStatusEnum = pgEnum("claim_status", ["pending_review", "documents_requested", "approved_for_payout", "completed", "rejected"]);

// ====================================================================================
// SECTION 1: USER & IDENTITY MANAGEMENT
// ====================================================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).unique(),
  role: userRoleEnum("role").default("member").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(), 
  token: text("token").notNull().unique(),   
  expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  streetAddress: text("street_address"),
  city: text("city"),
  state: text("state"),
  country: varchar("country", { length: 100 }),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  kycStatus: kycStatusEnum("kyc_status").default("not_submitted").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  governmentIdType: text("government_id_type"), 
  idCardFrontUrl: text("id_card_front_url"),
  idCardBackUrl: text("id_card_back_url"),
  nextOfKinName: text("next_of_kin_name").notNull(),
  nextOfKinRelationship: text("next_of_kin_relationship").notNull(),
  nextOfKinPhoneNumber: varchar("next_of_kin_phone_number", { length: 20 }).notNull(),
});

// ====================================================================================
// SECTION 2: CORE FINANCIAL INFRASTRUCTURE
// ====================================================================================

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "restrict" }), // NEVER cascade delete a wallet
  balance: bigint("balance", { mode: "bigint" }).default(0n).notNull(), 
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }), // Immutable ledger
  type: transactionTypeEnum("type").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(), 
  status: transactionStatusEnum("status").notNull(),
  description: text("description"),
  relatedEntityType: entityTypeEnum("related_entity_type"),
  relatedEntityId: uuid("related_entity_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index("transactions_user_id_idx").on(table.userId),
  createdAtIdx: index("transactions_created_at_idx").on(table.createdAt), // Crucial for ledger queries
}));

export const investmentCycles = pgTable("investment_cycles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: cycleStatusEnum("status").default("pending").notNull(),
  pricePerShare: bigint("price_per_share", { mode: "bigint" }).notNull(), 
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),    
  description: text("description"),
  totalProfitRealized: bigint("total_profit_realized", { mode: "bigint" }).default(0n), 
  investorProfitPool: bigint("investor_profit_pool", { mode: "bigint" }).default(0n),   
  organizationProfitShare: bigint("organization_profit_share", { mode: "bigint" }).default(0n), 
  profitDistributionStatus: distributionStatusEnum("profit_distribution_status").default("pending").notNull(),
});

export const shareholderInvestments = pgTable("shareholder_investments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  cycleId: uuid("cycle_id").notNull().references(() => investmentCycles.id),
  shares: bigint("shares", { mode: "bigint" }).notNull(), // Switched to bigint just in case of fractional shares in the future
  amountInvested: bigint("amount_invested", { mode: "bigint" }).notNull(), 
  profitEarned: bigint("profit_earned", { mode: "bigint" }).default(0n), 
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userCycleIdx: uniqueIndex("user_cycle_idx").on(table.userId, table.cycleId),
}));

// ====================================================================================
// SECTION 3: ORGANIZATIONAL MANAGEMENT
// ====================================================================================

export const organizationalLedger = pgTable("organizational_ledger", {
    id: uuid("id").defaultRandom().primaryKey(),
    entryType: ledgerEntryTypeEnum("entry_type").notNull(),
    source: text("source").notNull(), 
    amount: bigint("amount", { mode: "bigint" }).notNull(), 
    date: timestamp("date", { withTimezone: true }).notNull(),
    relatedCycleId: uuid("related_cycle_id").references(() => investmentCycles.id), 
    recordedBy: uuid("recorded_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const businessVentures = pgTable("business_ventures", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleId: uuid("cycle_id").notNull().references(() => investmentCycles.id),
  managedBy: uuid("managed_by").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  allocatedAmount: bigint("allocated_amount", { mode: "bigint" }).notNull(), 
  expectedProfit: bigint("expected_profit", { mode: "bigint" }).notNull(), 
  profitRealized: bigint("profit_realized", { mode: "bigint" }).default(0n), 
});

// ====================================================================================
// SECTION 4: OPERATIONAL WORKFLOWS
// ====================================================================================

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  amount: bigint("amount", { mode: "bigint" }).notNull(), 
  withdrawalType: withdrawalTypeEnum("withdrawal_type").notNull(),
  relatedCycleId: uuid("related_cycle_id").references(() => investmentCycles.id),
  bankName: text("bank_name").notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  accountName: text("account_name").notNull(), 
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  approvedBy: uuid("approved_by").references(() => users.id),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),
});

export const emergencyWithdrawalRequests = pgTable("emergency_withdrawal_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    reason: text("reason").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(), 
    status: withdrawalStatusEnum("status").default("pending").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const deceasedUserClaims = pgTable("deceased_user_claims", {
    id: uuid("id").defaultRandom().primaryKey(),
    deceasedUserId: uuid("deceased_user_id").notNull().unique().references(() => users.id),
    claimantName: text("claimant_name").notNull(),
    claimantContact: text("claimant_contact").notNull(),
    status: claimStatusEnum("status").default("pending_review").notNull(),
    deathCertificateUrl: text("death_certificate_url"), 
    adminNotes: text("admin_notes"),
    processedBy: uuid("processed_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});