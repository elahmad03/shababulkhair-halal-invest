import {
  User,
  UserProfile,
  WalletSchema,
  TransactionSchema,
  InvestmentCycleSchema,
  ShareholderInvestmentSchema,
  OrganizationalExpenseSchema,
  WithdrawalRequest,
  UserSchema,
  UserProfileSchema,
  UserPreferencesSchema,
  WithdrawalRequestSchema,
  BusinessVentureSchema,
  ExpenseContributionSchema,
} from "@/schemas/app";
import { z } from "zod";

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const lastMonth = new Date(today);
lastMonth.setDate(today.getDate() - 30);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

const HASH_PLACEHOLDER =
  "a0b1c2d3e4f5a0b1c2d3e4f5a0b1c2d3e4f5a0b1c2d3e4f5a0b1c2d3e4f5a0b1";

// --- 1. USERS ---
const mockUsers: User[] = z.array(UserSchema).parse([
  {
    id: 1,
    fullName: "Ahmad Ibrahim",
    email: "ahmad.ibrahim@app.com",
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: "+2348012345678",
    role: "admin",
    createdAt: lastMonth,
  },
  {
    id: 2,
    fullName: "Abubakar Mohammed",
    email: "abubakar.mohammed@app.com",
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: "+2348011223344",
    role: "committee",
    createdAt: lastMonth,
  },
  {
    id: 3,
    fullName: "Aminu Usman Mohammed",
    email: "aminu.mohammed@app.com",
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: "+2348019876543",
    role: "member",
    createdAt: yesterday,
  },
  {
    id: 4,
    fullName: "Sani Mohammed",
    email: "sani.m@example.com",
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: "+2348019876543",
    role: "committee",
    createdAt: yesterday,
  },
  {
    id: 5,
    fullName: "Ismail Lawal",
    email: "ismail.l@example.com",
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: "+2348019876543",
    role: "committee",
    createdAt: yesterday,
  },
]);

// --- USER PROFILES ---
const mockUserProfiles: UserProfile[] = z.array(UserProfileSchema).parse([
  {
    id: 1,
    userId: 1,
    streetAddress: "No.90 Modibbo adama Way",
    city: "Yola",
    state: "Adamawa",
    country: "Nigeria",
    dateOfBirth: new Date("1985-01-15"),
    governmentIdType: "passport",
    governmentIdNumber: "A12345678",
    nextOfKinName: "khadija Ibrahim",
    nextOfKinRelationship: "Sister",
    nextOfKinPhoneNumber: "+2348010000000",
  },
  {
    id: 2,
    userId: 2,
    streetAddress: "No. 109 Modibbo Adamawa Way",
    city: "Yola",
    state: "Adamawa",
    country: "Nigeria",
    dateOfBirth: new Date("1990-04-22"),
    governmentIdType: "national_id",
    governmentIdNumber: "NIN22334455",
    nextOfKinName: "adamu Bello",
    nextOfKinRelationship: "Brother",
    nextOfKinPhoneNumber: "+2348022222222",
  },
  {
    id: 3,
    userId: 3,
    streetAddress: "Top 10 plaza",
    city: "yola",
    state: "Adamawa",
    country: "Nigeria",
    dateOfBirth: new Date("1995-07-10"),
    governmentIdType: "drivers_license",
    governmentIdNumber: "DL987654321",
    nextOfKinName: "Usman Mohammed",
    nextOfKinRelationship: "Father",
    nextOfKinPhoneNumber: "+2348033333333",
  },
  {
    id: 4,
    userId: 4,
    streetAddress: "no 70 modibbo adama way",
    city: "yola",
    state: "Adamawa",
    country: "Nigeria",
    dateOfBirth: new Date("1995-07-10"),
    governmentIdType: "drivers_license",
    governmentIdNumber: "DL987654321",
    nextOfKinName: "Usman Mohammed",
    nextOfKinRelationship: "Father",
    nextOfKinPhoneNumber: "+2348033333333",
  },
  {
    id: 5,
    userId: 5,
    streetAddress: "no 110 modibbo adama way",
    city: "yola",
    state: "Adamawa",
    country: "Nigeria",
    dateOfBirth: new Date("1995-07-10"),
    governmentIdType: "drivers_license",
    governmentIdNumber: "DL987654321",
    nextOfKinName: "Usman Mohammed",
    nextOfKinRelationship: "Father",
    nextOfKinPhoneNumber: "+2348033333333",
  },
]);

// --- USER PREFERENCES ---
const mockUserPreferences = z.array(UserPreferencesSchema).parse([
  { id: 1, userId: 1, autoReinvest: true },
  { id: 2, userId: 2, autoReinvest: false },
  { id: 3, userId: 3, autoReinvest: true },
  { id: 4, userId: 4, autoReinvest: false },
  { id: 5, userId: 5, autoReinvest: true },
]);

// --- 2. FINANCIAL & INVESTMENT SCHEMAS ---

// WALLETS
const mockWallets = z.array(WalletSchema).parse([
  { id: 1, userId: 1, balance: 15000000.00, updatedAt: today },
  { id: 2, userId: 2, balance: 3500000.00, updatedAt: today },
  { id: 3, userId: 3, balance: 35000000.00, updatedAt: today },
  { id: 4, userId: 4, balance: 3500000.00, updatedAt: today },
  { id: 5, userId: 5, balance: 3500000.00, updatedAt: today },
]);

// TRANSACTIONS
const mockTransactions = z.array(TransactionSchema).parse([
  {
    id: 1,
    userId: 3,
    type: "deposit",
    amount: 10000000.00,
    status: "completed",
    description: "Initial Deposit",
    createdAt: yesterday,
  },
  {
    id: 2,
    userId: 3,
    type: "share_purchase",
    amount: 5000000.00,
    status: "completed",
    description: "Purchase 50 shares for Cycle 1",
    createdAt: today,
  },
]);

// INVESTMENT CYCLES
const mockInvestmentCycles = z.array(InvestmentCycleSchema).parse([
  { id: 1, name: "August Cycle 2025", status: "completed" },
  { id: 2, name: "September Cycle 2025", status: "active" },
  { id: 3, name: "October Cycle 2025", status: "open_for_investment" },
]);

// SHAREHOLDER INVESTMENTS
const mockShareholderInvestments = z.array(ShareholderInvestmentSchema).parse([
  {
    id: 1,
    userId: 3,
    cycleId: 1,
    shares: 50,
    amountInvested: 500000.00,
    profitEarned: 25000.00,
  },
]);

// ** NEW **: BUSINESS VENTURES
const mockBusinessVentures = z.array(BusinessVentureSchema).parse([
  {
    id: 1,
    cycleId: 2, // September Cycle 2025 (active)
    managedBy: 2, // Abubakar Mohammed
    companyName: "ABK Opera Communication",
    allocatedAmount: 2500000.00,
    expectedProfit: 400000.00,
    profitRealized: 150000.00,
  },
  {
    id: 2,
    cycleId: 2, // September Cycle 2025 (active)
    managedBy: 5, // Ismail Lawal
    companyName: "Ismail Key",
    allocatedAmount: 1800000.00,
    expectedProfit: 350000.00,
    profitRealized: 50000.00,
  },
  {
    id: 3,
    cycleId: 2, // September Cycle 2025 (active)
    managedBy: 4, // Sani Mohammed
    companyName: "Alhaji Sani Boutique Company",
    allocatedAmount: 3000000.00,
    expectedProfit: 600000.00,
    profitRealized: 0.00,
  },
]);

// --- 3. ADMIN & ORGANIZATIONAL SCHEMAS ---

// ** UPDATED **: ORGANIZATIONAL EXPENSES
const mockOrganizationalExpenses = z.array(OrganizationalExpenseSchema).parse([
  {
    id: 1,
    description: "CAC Registration",
    amount: 15000.00,
    date: new Date("2025-09-01"),
    status: "paid_by_org", // Updated to match new schema
    recordedBy: 1, // Ahmad
    createdAt: new Date("2025-09-02"),
  },
  {
    id: 2,
    description: "Office Internet Subscription (6 Months)",
    amount: 75000.00,
    date: lastWeek,
    status: "pending_reimbursement", // Paid by a member
    recordedBy: 1, // Ahmad
    createdAt: lastWeek,
  },
]);

// ** NEW **: EXPENSE CONTRIBUTIONS
const mockExpenseContributions = z.array(ExpenseContributionSchema).parse([
  {
    id: 1,
    expenseId: 2, // Corresponds to the "Office Internet Subscription"
    userId: 2, // Paid by Abubakar Mohammed
    amountContributed: 75000.00,
    reimbursementStatus: "pending",
    reimbursementDate: null,
  },
]);

// WITHDRAWAL REQUESTS
const mockWithdrawalRequests: WithdrawalRequest[] = z
  .array(WithdrawalRequestSchema)
  .parse([
    {
      id: 1,
      userId: 3,
      amount: 50000.00,
      withdrawalType: "wallet_balance",
      relatedCycleId: null,
      status: "pending",
      requestedAt: today,
      approvedBy: null,
      processedAt: null,
      rejectionReason: null,
    },
  ]);

export const mockData = {
  users: mockUsers,
  userProfiles: mockUserProfiles,
  userPreferences: mockUserPreferences,
  wallets: mockWallets,
  transactions: mockTransactions,
  investmentCycles: mockInvestmentCycles,
  shareholderInvestments: mockShareholderInvestments,
  businessVentures: mockBusinessVentures, // <-- New Export
  organizationalExpenses: mockOrganizationalExpenses,
  expenseContributions: mockExpenseContributions, // <-- New Export
  withdrawalRequests: mockWithdrawalRequests,
};
