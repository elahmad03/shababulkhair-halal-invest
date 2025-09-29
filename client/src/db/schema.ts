import { serial, integer, text, varchar, timestamp, date, pgTable, boolean, numeric } from 'drizzle-orm/pg-core';

// =======================================
// 1. USER & AUTHENTICATION SCHEMAS
// =======================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).unique(),
  role: text('role', { enum: ['member', 'committee', 'admin'] }).default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  streetAddress: text('street_address'),
  city: text('city'),
  state: text('state'),
  country: varchar('country', { length: 100 }),
  dateOfBirth: date('date_of_birth'),
  governmentIdType: text('government_id_type', { enum: ['national_id', 'passport', 'drivers_license'] }),
  governmentIdNumber: varchar('government_id_number', { length: 100 }).unique(),
  nextOfKinName: text('next_of_kin_name'),
  nextOfKinRelationship: text('next_of_kin_relationship'),
  nextOfKinPhoneNumber: varchar('next_of_kin_phone_number', { length: 20 }),
});

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  autoReinvest: boolean('auto_reinvest').default(false).notNull(),
});


// =======================================
// 2. FINANCIAL & INVESTMENT SCHEMAS
// =======================================

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  balance: numeric('balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['deposit', 'share_purchase', 'capital_return', 'profit_distribution', 'withdrawal'] }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed'] }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const investmentCycles = pgTable('investment_cycles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status', { enum: ['pending', 'open_for_investment', 'active', 'completed'] }).default('pending'),
});

export const shareholderInvestments = pgTable('shareholder_investments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  cycleId: integer('cycle_id').notNull().references(() => investmentCycles.id),
  shares: integer('shares').notNull(),
  amountInvested: numeric('amount_invested', { precision: 15, scale: 2 }).notNull(),
  profitEarned: numeric('profit_earned', { precision: 15, scale: 2 }).default('0.00'),
});


// =======================================
// 3. ADMIN & ORGANIZATIONAL SCHEMAS
// =======================================

export const organizationalExpenses = pgTable('organizational_expenses', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  date: date('date').notNull(),
  contributorId: integer('contributor_id').references(() => users.id),
  status: text('status', { enum: ['paid_by_org', 'pending_reimbursement', 'reimbursed'] }).notNull(),
  reimbursementDate: date('reimbursement_date'),
  recordedBy: integer('recorded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const withdrawalRequests = pgTable('withdrawal_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  withdrawalType: text('withdrawal_type', { enum: ['wallet_balance', 'full_divestment', 'profit_only'] }).notNull(),
  relatedCycleId: integer('related_cycle_id').references(() => investmentCycles.id),
  status: text('status', { enum: ['pending', 'approved', 'processed', 'rejected'] }).default('pending').notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  approvedBy: integer('approved_by').references(() => users.id),
  processedAt: timestamp('processed_at'),
  rejectionReason: text('rejection_reason'),
});