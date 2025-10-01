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
} from '@/schemas/app';
import { z } from 'zod';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const lastMonth = new Date(today);
lastMonth.setDate(today.getDate() - 30);


const HASH_PLACEHOLDER = 'a0b1c2d3e4f5a0b1c2d3e4f5a0b1c2d3e4f5a0b1c2d3e4f5a0b1c2d3e4f5a0b1'; 

// --- 1. USERS ---
const mockUsers: User[] = z.array(UserSchema).parse([
  {
    id: 1,
    fullName: 'Ahmad Ibrahim',
    email: 'ahmad.ibrahim@app.com',
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: '+2348012345678',
    role: 'admin',
    createdAt: lastMonth,
  },
  {
    id: 2,
    fullName: 'Abubakar Mohammed',
    email: 'abubakar.mohammed@app.com',
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: '+2348011223344',
    role: 'committee',
    createdAt: lastMonth,
  },
  {
    id: 3,
    fullName: 'Aminu Usman Mohammed',
    email: 'aminu.mohammed@app.com',
    passwordHash: HASH_PLACEHOLDER,
    phoneNumber: '+2348019876543',
    role: 'member',
    createdAt: yesterday,
  },
]);

// --- USER PROFILES ---
const mockUserProfiles: UserProfile[] = z.array(UserProfileSchema).parse([
  {
    id: 1,
    userId: 1,
    streetAddress: '123 Admin Lane',
    city: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    dateOfBirth: new Date('1985-01-15'),
    governmentIdType: 'passport',
    governmentIdNumber: 'A12345678',
    nextOfKinName: 'Fatima Ibrahim',
    nextOfKinRelationship: 'Spouse',
    nextOfKinPhoneNumber: '+2348010000000',
  },
  {
    id: 2,
    userId: 2,
    streetAddress: '45 Unity Road',
    city: 'Kano',
    state: 'Kano',
    country: 'Nigeria',
    dateOfBirth: new Date('1990-04-22'),
    governmentIdType: 'national_id',
    governmentIdNumber: 'NIN22334455',
    nextOfKinName: 'Mohammed Bello',
    nextOfKinRelationship: 'Brother',
    nextOfKinPhoneNumber: '+2348022222222',
  },
  {
    id: 3,
    userId: 3,
    streetAddress: '78 Independence Avenue',
    city: 'Kaduna',
    state: 'Kaduna',
    country: 'Nigeria',
    dateOfBirth: new Date('1995-07-10'),
    governmentIdType: 'drivers_license',
    governmentIdNumber: 'DL987654321',
    nextOfKinName: 'Usman Mohammed',
    nextOfKinRelationship: 'Father',
    nextOfKinPhoneNumber: '+2348033333333',
  },
]);

// --- USER PREFERENCES ---
const mockUserPreferences = z.array(UserPreferencesSchema).parse([
  { id: 1, userId: 1, autoReinvest: true },
  { id: 2, userId: 2, autoReinvest: false },
  { id: 3, userId: 3, autoReinvest: true },
]);

// --- 2. FINANCIAL & INVESTMENT SCHEMAS ---

// WALLETS
const mockWallets = z.array(WalletSchema).parse([
  {
    id: 1,
    userId: 1,
    balance: '5000.00', // Ahmad wallet
    updatedAt: today,
  },
  {
    id: 3,
    userId: 3,
    balance: '12500.50', // Aminu wallet
    updatedAt: today,
  },
]);

// TRANSACTIONS
const mockTransactions = z.array(TransactionSchema).parse([
  {
    id: 1,
    userId: 3,
    type: 'deposit',
    amount: '10000000.00',
    status: 'completed',
    description: 'Initial Deposit',
    createdAt: yesterday,
  },
  {
    id: 2,
    userId: 3,
    type: 'share_purchase',
    amount: '5000000.00',
    status: 'completed',
    description: 'Purchase 50 shares for Cycle 1',
    createdAt: today,
  },
]);

// INVESTMENT CYCLES
const mockInvestmentCycles = z.array(InvestmentCycleSchema).parse([
  { id: 1, name: 'Cycle Q1 2025: Real Estate', status: 'completed' },
  { id: 2, name: 'Cycle Q2 2025: Agriculture', status: 'active' },
  { id: 3, name: 'Cycle Q3 2025: Technology', status: 'open_for_investment' },
]);

// SHAREHOLDER INVESTMENTS
const mockShareholderInvestments = z.array(ShareholderInvestmentSchema).parse([
  {
    id: 1,
    userId: 3,
    cycleId: 1,
    shares: 50,
    amountInvested: '5000.00',
    profitEarned: '250.00',
  },
]);

// --- 3. ADMIN & ORGANIZATIONAL SCHEMAS ---

// ORGANIZATIONAL EXPENSES
const mockOrganizationalExpenses = z.array(OrganizationalExpenseSchema).parse([
  {
    id: 1,
    description: 'Office Rent for the month',
    amount: '1500.00',
    date: new Date('2025-09-01'),
    contributorId: null,
    status: 'paid_by_org',
    reimbursementDate: null,
    recordedBy: 1, // Ahmad
    createdAt: new Date('2025-09-02'),
  },
]);

// WITHDRAWAL REQUESTS
const mockWithdrawalRequests: WithdrawalRequest[] = z.array(WithdrawalRequestSchema).parse([
  {
    id: 1,
    userId: 3,
    amount: '500.00',
    withdrawalType: 'wallet_balance',
    relatedCycleId: null,
    status: 'pending',
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
  organizationalExpenses: mockOrganizationalExpenses,
  withdrawalRequests: mockWithdrawalRequests,
};
