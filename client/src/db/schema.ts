import {
  serial,
  integer,
  text,
  varchar,
  timestamp,
  date,
  pgTable,
  boolean,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// =======================================
// 1. USER & AUTHENTICATION SCHEMAS
// =======================================

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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIdx: index("email_idx").on(table.email),
      roleIdx: index("role_idx").on(table.role),
    };
  }
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    streetAddress: text("street_address"),
    city: text("city"),
    state: text("state"),
    country: varchar("country", { length: 100 }),
    dateOfBirth: date("date_of_birth"),
    governmentIdType: text("government_id_type", {
      enum: ["national_id", "passport", "drivers_license"],
    }),
    governmentIdNumber: varchar("government_id_number", {
      length: 100,
    }).unique(),
    nextOfKinName: text("next_of_kin_name"),
    nextOfKinRelationship: text("next_of_kin_relationship"),
    nextOfKinPhoneNumber: varchar("next_of_kin_phone_number", { length: 20 }),
  },
  (table) => {
    return {
      userIdIdx: index("user_profiles_user_id_idx").on(table.userId),
    };
  }
);

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    autoReinvest: boolean("auto_reinvest").default(false).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("user_preferences_user_id_idx").on(table.userId),
    };
  }
);

// =======================================
// 2. FINANCIAL & INVESTMENT SCHEMAS
// =======================================

export const wallets = pgTable(
  "wallets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    balance: numeric("balance", { precision: 15, scale: 2 })
      .default("0.00")
      .notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("wallets_user_id_idx").on(table.userId),
    };
  }
);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type", {
      enum: [
        "deposit",
        "share_purchase",
        "capital_return",
        "profit_distribution",
        "withdrawal",
      ],
    }).notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    status: text("status", {
      enum: ["pending", "completed", "failed"],
    }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("transactions_user_id_idx").on(table.userId),
      typeIdx: index("transactions_type_idx").on(table.type),
    };
  }
);

export const investmentCycles = pgTable("investment_cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status", {
    enum: ["pending", "open_for_investment", "active", "completed"],
  }).default("pending"),
});

export const shareholderInvestments = pgTable(
  "shareholder_investments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    cycleId: integer("cycle_id")
      .notNull()
      .references(() => investmentCycles.id),
    shares: integer("shares").notNull(),
    amountInvested: numeric("amount_invested", {
      precision: 15,
      scale: 2,
    }).notNull(),
    profitEarned: numeric("profit_earned", { precision: 15, scale: 2 }).default(
      "0.00"
    ),
  },
  (table) => {
    return {
      userCycleIdx: uniqueIndex("user_cycle_idx").on(
        table.userId,
        table.cycleId
      ),
    };
  }
);

export const businessVentures = pgTable(
  "business_ventures",
  {
    id: serial("id").primaryKey(),
    cycleId: integer("cycle_id")
      .notNull()
      .references(() => investmentCycles.id),
    managedBy: integer("managed_by")
      .notNull()
      .references(() => users.id),
    companyName: text("company_name").notNull(),
    allocatedAmount: numeric("allocated_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    expectedProfit: numeric("expected_profit", {
      precision: 15,
      scale: 2,
    }).notNull(),
    profitRealized: numeric("profit_realized", {
      precision: 15,
      scale: 2,
    }).default("0.00"),
  },
  (table) => {
    return {
      cycleIdIdx: index("business_ventures_cycle_id_idx").on(table.cycleId),
    };
  }
);

// =======================================
// 3. ADMIN & ORGANIZATIONAL SCHEMAS
// =======================================

export const organizationalExpenses = pgTable(
  "organizational_expenses",
  {
    id: serial("id").primaryKey(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: date("date").notNull(),
    // ADDED: status field to match mock data structure
    status: text("status", {
      enum: ["paid_by_org", "pending_reimbursement", "reimbursed"],
    })
      .default("paid_by_org")
      .notNull(),
    recordedBy: integer("recorded_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      recordedByIdx: index("org_expenses_recorded_by_idx").on(table.recordedBy),
    };
  }
);

export const expenseContributions = pgTable(
  "expense_contributions",
  {
    id: serial("id").primaryKey(),
    expenseId: integer("expense_id")
      .notNull()
      .references(() => organizationalExpenses.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    amountContributed: numeric("amount_contributed", {
      precision: 12,
      scale: 2,
    }).notNull(),
    reimbursementStatus: text("reimbursement_status", {
      enum: ["pending", "reimbursed"],
    }).default("pending"),
    reimbursementDate: date("reimbursement_date"),
  },
  (table) => {
    return {
      expenseIdIdx: index("exp_contrib_expense_id_idx").on(table.expenseId),
      userIdIdx: index("exp_contrib_user_id_idx").on(table.userId),
    };
  }
);

export const withdrawalRequests = pgTable(
  "withdrawal_requests",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    withdrawalType: text("withdrawal_type", {
      enum: ["wallet_balance", "full_divestment", "profit_only"],
    }).notNull(),
    relatedCycleId: integer("related_cycle_id").references(
      () => investmentCycles.id
    ),
    status: text("status", {
      enum: ["pending", "approved", "processed", "rejected"],
    })
      .default("pending")
      .notNull(),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    approvedBy: integer("approved_by").references(() => users.id),
    processedAt: timestamp("processed_at"),
    rejectionReason: text("rejection_reason"),
  },
  (table) => {
    return {
      userIdIdx: index("withdrawal_req_user_id_idx").on(table.userId),
      statusIdx: index("withdrawal_req_status_idx").on(table.status),
    };
  }
);