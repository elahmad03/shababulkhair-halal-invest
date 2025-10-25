import type {
  User,
  UserProfile,
  VerificationTokens,
  Wallet,
  Transaction,
  InvestmentCycle,
  ShareholderInvestment,
  BusinessVenture,
  OrganizationalLedger,
  UserPreference,
  WithdrawalRequest,
  EmergencyWithdrawalRequest,
  DeceasedUserClaim,
  Notification,
} from "@/db/types";

/* ===============================================================
   USERS + AUTH
   =============================================================== */

export const mockUsers: User[] = [
  {
    id: 1,
    fullName: "Ahmad Ibrahim",
    email: "ahmad@example.com",
    passwordHash: "hashed_password_1",
    phoneNumber: "08031234567",
    role: "admin",
    status: "active",
    emailVerified: new Date("2025-01-01"),
    createdAt: new Date("2024-12-01"),
  },
  {
    id: 2,
    fullName: "Ismail Lawwali",
    email: "ismail@example.com",
    passwordHash: "hashed_password_2",
    phoneNumber: "08039876543",
    role: "committee",
    status: "active",
    emailVerified: new Date("2025-01-05"),
    createdAt: new Date("2024-12-02"),
  },
  {
    id: 3,
    fullName: "Abubakar Mohammed",
    email: "abubakar@example.com",
    passwordHash: "hashed_password_3",
    phoneNumber: "08034561234",
    role: "member",
    status: "active",
    emailVerified: new Date("2025-01-06"),
    createdAt: new Date("2024-12-05"),
  },
  {
    id: 4,
    fullName: "Aminu Mohammed",
    email: "aminu@example.com",
    passwordHash: "hashed_password_4",
    phoneNumber: "08033445566",
    role: "member",
    status: "active",
    emailVerified: new Date("2025-01-07"),
    createdAt: new Date("2024-12-06"),
  },
  {
    id: 5,
    fullName: "Muhammed Sani",
    email: "usman@example.com",
    passwordHash: "hashed_password_5",
    phoneNumber: "08036667788",
    role: "committee",
    status: "active",
    emailVerified: new Date("2025-01-08"),
    createdAt: new Date("2024-12-07"),
  },
];

export const mockVerificationTokens: VerificationTokens[] = [
  {
    identifier: "ahmad@example.com",
    token: "token_1",
    expires: new Date("2025-12-31"),
  },
];

/* ===============================================================
   USER PROFILES
   =============================================================== */

export const mockUserProfiles: UserProfile[] = [
  {
    id: 1,
    userId: 1,
    streetAddress: "No. 1 Unity Road",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    dateOfBirth: "12-18-1995",
    kycStatus: "verified",
    profilePictureUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    governmentIdType: "national_id",
    idCardFrontUrl: "https://example.com/id_front.jpg",
    idCardBackUrl: "https://example.com/id_back.jpg",
    nextOfKinName: "Ibrahim Musa",
    nextOfKinRelationship: "Brother",
    nextOfKinPhoneNumber: "08032223344",
  },
  
];

/* ===============================================================
   WALLETS
   =============================================================== */

export const mockWallets: Wallet[] = [
  { id: 1, userId: 1, balance: 3000000n, updatedAt: new Date("2025-10-01") },
  { id: 2, userId: 2, balance: 1500000n, updatedAt: new Date("2025-10-01") },
  { id: 3, userId: 3, balance: 2000000n, updatedAt: new Date("2025-10-01") },
  { id: 4, userId: 4, balance: 1000000n, updatedAt: new Date("2025-10-01") },
  { id: 5, userId: 5, balance: 2500000n, updatedAt: new Date("2025-10-01") },
];

/* ===============================================================
   INVESTMENT CYCLES (May–October)
   =============================================================== */

export const mockInvestmentCycles: InvestmentCycle[] = [
  {
    id: 1,
    name: "May 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n, // 10,000 NGN in kobo
    startDate: "2025-05-01",
    endDate: "2025-05-31",
    totalProfitRealized: 250000000n,
    investorProfitPool: 200000000n,
    organizationProfitShare: 50000000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 2,
    name: "June 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    totalProfitRealized: 300000000n,
    investorProfitPool: 240000000n,
    organizationProfitShare: 60000000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 3,
    name: "July 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    totalProfitRealized: 350000000n,
    investorProfitPool: 280000000n,
    organizationProfitShare: 70000000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 4,
    name: "August 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: "2025-08-01",
    endDate: "2025-08-31",
    totalProfitRealized: 400000000n,
    investorProfitPool: 320000000n,
    organizationProfitShare: 80000000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 5,
    name: "September 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: "2025-09-01",
    endDate: "2025-09-30",
    totalProfitRealized: 450000000n,
    investorProfitPool: 360000000n,
    organizationProfitShare: 90000000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 6,
    name: "October 2025 Cycle",
    status: "active",
    pricePerShare: 1000000n,
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    totalProfitRealized: 0n,
    investorProfitPool: 0n,
    organizationProfitShare: 0n,
    profitDistributionStatus: "pending",
  },
  {
    id: 7,
    name: "November 2025 Cycle",
    status: "open_for_investment",
    pricePerShare: 1000000n,
    startDate: "2025-11-01",
    endDate: "2025-11-30",
    totalProfitRealized: 0n,
    investorProfitPool: 0n,
    organizationProfitShare: 0n,
    profitDistributionStatus: "pending",
  },
];

/* ===============================================================
   SHAREHOLDER INVESTMENTS (Randomized)
   =============================================================== */

export const mockShareholderInvestments: ShareholderInvestment[] = [
  {
    id: 1,
    userId: 1,
    cycleId: 1,
    shares: 10,
    amountInvested: 10000000n,
    profitEarned: 2000000n,
    createdAt: new Date("2025-05-01"),
  },
  {
    id: 2,
    userId: 1,
    cycleId: 2,
    shares: 5,
    amountInvested: 5000000n,
    profitEarned: 1000000n,
    createdAt: new Date("2025-06-01"),
  },
  {
    id: 3,
    userId: 3,
    cycleId: 3,
    shares: 15,
    amountInvested: 15000000n,
    profitEarned: 3000000n,
    createdAt: new Date("2025-07-01"),
  },
];

/* ===============================================================
   TRANSACTIONS
   =============================================================== */

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    type: "share_purchase",
    amount: 10000000n,
    status: "completed",
    description: "10 shares purchased in May Cycle",
    relatedEntityType: "investment",
    relatedEntityId: 1,
    createdAt:new Date( "2025-05-01"),
  },
  {
    id: 2,
    userId: 1,
    type: "profit_distribution",
    amount: 2000000n,
    status: "completed",
    description: "Profit from May Cycle",
    relatedEntityType: "investment",
    relatedEntityId: 1,
    createdAt: new Date("2025-06-01"),
  },
];

/* ===============================================================
   BUSINESS VENTURES + ORGANIZATIONAL LEDGER
   =============================================================== */

export const mockBusinessVentures: BusinessVenture[] = [
  {
    id: 1,
    cycleId: 1,
    managedBy: 2,
    companyName: "Unity Traders Ltd.",
    allocatedAmount: 200000000n,
    expectedProfit: 250000000n,
    profitRealized: 240000000n,
  },
];

export const mockOrganizationalLedger: OrganizationalLedger[] = [
  {
    id: 1,
    entryType: "income",
    source: "Profit Share from August 2025 Cycle",
    amount: 80000000n,
    date: "2025-09-01",
    relatedCycleId: 4,
    recordedBy: 1,
    createdAt: new Date("2025-09-01"),
  },
];

/* ===============================================================
   USER PREFERENCES + WITHDRAWALS + CLAIMS + NOTIFICATIONS
   =============================================================== */

export const mockUserPreferences: UserPreference[] = [
  { id: 1, userId: 1, autoReinvest: true },
  { id: 2, userId: 2, autoReinvest: false },
];

export const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: 1,
    userId: 1,
    amount: 2000000n,
    withdrawalType: "profit_only",
    relatedCycleId: 1,
    status: "processed",
    requestedAt: new Date("2025-06-05"),
    approvedBy: 2,
    processedAt: new Date("2025-06-10"),
    rejectionReason: "invalid "
  },
];

export const mockEmergencyWithdrawalRequests: EmergencyWithdrawalRequest[] = [
  {
    id: 1,
    userId: 4,
    reason: "Medical emergency",
    amount: 1000000n,
    status: "approved",
    requestedAt: new Date("2025-07-10"),
    processedAt: new Date("2025-07-12"),
  },
];

export const mockDeceasedUserClaims: DeceasedUserClaim[] = [
  {
    id: 1,
    deceasedUserId: 3,
    claimantName: "Fatima Mohammed",
    claimantContact: "08031234599",
    status: "pending_review",
    deathCertificateUrl: "https://example.com/death_cert.pdf",
    adminNotes: null,
    processedBy: null,
    createdAt: new Date("2025-08-01"),
    updatedAt: null,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    title: "Profit Credited",
    message: "Your May cycle profit has been added to your wallet.",
    isRead: false,
    link: "/wallet",
    createdAt: new Date("2025-06-01"),
  },
];
