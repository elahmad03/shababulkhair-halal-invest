
export const usersData = [
  {
    id: 1,
    fullName: "Ahmad Ibrahim",
    email: "ahmad.ibrahim@example.com",
    passwordHash: "hashed_password_ahmad",
    phoneNumber: "+2348011111111",
    role: "admin",
    status: "active",
    emailVerified: new Date("2025-05-01T10:00:00Z"),
    createdAt: new Date("2025-04-30T09:00:00Z"),
  },
  {
    id: 2,
    fullName: "Ismail Lawwali",
    email: "ismail.lawwali@example.com",
    passwordHash: "hashed_password_ismail",
    phoneNumber: "+2348022222222",
    role: "committee",
    status: "active",
    emailVerified: new Date("2025-05-02T10:00:00Z"),
    createdAt: new Date("2025-05-01T09:00:00Z"),
  },
  {
    id: 3,
    fullName: "Abubakar Mohammed",
    email: "abubakar.mohammed@example.com",
    passwordHash: "hashed_password_abubakar",
    phoneNumber: "+2348033333333",
    role: "member",
    status: "active",
    emailVerified: new Date("2025-05-03T10:00:00Z"),
    createdAt: new Date("2025-05-02T09:00:00Z"),
  },
  {
    id: 4,
    fullName: "Aminu Mohammed",
    email: "aminu.mohammed@example.com",
    passwordHash: "hashed_password_aminu",
    phoneNumber: "+2348044444444",
    role: "member",
    status: "active",
    emailVerified: new Date("2025-05-03T11:00:00Z"),
    createdAt: new Date("2025-05-02T09:00:00Z"),
  },
  {
    id: 5,
    fullName: "Usman",
    email: "usman@example.com",
    passwordHash: "hashed_password_usman",
    phoneNumber: "+2348055555555",
    role: "member",
    status: "active",
    emailVerified: new Date("2025-05-03T11:00:00Z"),
    createdAt: new Date("2025-05-02T09:00:00Z"),
  },
];

export const verificationTokensData = [
  {
    identifier: "ahmad.ibrahim@example.com",
    token: "tok_ahmad_2025_v1",
    expires: new Date("2025-05-10T00:00:00Z"),
  },
  {
    identifier: "usman@example.com",
    token: "tok_usman_2025_v1",
    expires: new Date("2025-06-01T00:00:00Z"),
  },
];

export const userProfilesData = [
  {
    id: 1,
    userId: 1,
    streetAddress: "12 Waziri Street",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    dateOfBirth: new Date("1995-01-12"),
    kycStatus: "verified",
    profilePictureUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/ahmad.jpg",
    governmentIdType: "national_id",
    idCardFrontUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_front.jpg",
    idCardBackUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_back.jpg",
    nextOfKinName: "Ibrahim Sulaiman",
    nextOfKinRelationship: "Brother",
    nextOfKinPhoneNumber: "+2348060000001",
  },
  {
    id: 2,
    userId: 2,
    streetAddress: "22 Airport Road",
    city: "Kano",
    state: "Kano",
    country: "Nigeria",
    dateOfBirth: new Date("1992-03-15"),
    kycStatus: "verified",
    profilePictureUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/ismail.jpg",
    governmentIdType: "passport",
    idCardFrontUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_front2.jpg",
    idCardBackUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_back2.jpg",
    nextOfKinName: "Lawwali Garba",
    nextOfKinRelationship: "Cousin",
    nextOfKinPhoneNumber: "+2348060000002",
  },
  {
    id: 3,
    userId: 3,
    streetAddress: "45 GRA Layout",
    city: "Kaduna",
    state: "Kaduna",
    country: "Nigeria",
    dateOfBirth: new Date("1990-06-20"),
    kycStatus: "verified",
    profilePictureUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/abubakar.jpg",
    governmentIdType: "drivers_license",
    idCardFrontUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_front3.jpg",
    idCardBackUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_back3.jpg",
    nextOfKinName: "Mohammed Bello",
    nextOfKinRelationship: "Father",
    nextOfKinPhoneNumber: "+2348060000003",
  },
  {
    id: 4,
    userId: 4,
    streetAddress: "6 Aliyu Crescent",
    city: "Sokoto",
    state: "Sokoto",
    country: "Nigeria",
    dateOfBirth: new Date("1993-09-10"),
    kycStatus: "verified",
    profilePictureUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/aminu.jpg",
    governmentIdType: "voters_card",
    idCardFrontUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_front4.jpg",
    idCardBackUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_back4.jpg",
    nextOfKinName: "Amina Mohammed",
    nextOfKinRelationship: "Sister",
    nextOfKinPhoneNumber: "+2348060000004",
  },
  {
    id: 5,
    userId: 5,
    streetAddress: "8 Market Road",
    city: "Katsina",
    state: "Katsina",
    country: "Nigeria",
    dateOfBirth: new Date("1998-04-08"),
    kycStatus: "pending_review",
    profilePictureUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/usman.jpg",
    governmentIdType: "national_id",
    idCardFrontUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_front5.jpg",
    idCardBackUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/id_back5.jpg",
    nextOfKinName: "Abdullahi Usman",
    nextOfKinRelationship: "Brother",
    nextOfKinPhoneNumber: "+2348060000005",
  },
];

export const walletsData = [
  // Keep balances consistent with initial deposits + realized profits - withdrawals
  { id: 1, userId: 1, balance: 5000000n, updatedAt: new Date("2025-10-15T10:00:00Z") }, // ₦50,000
  { id: 2, userId: 2, balance: 3200000n, updatedAt: new Date("2025-10-15T10:00:00Z") }, // ₦32,000
  { id: 3, userId: 3, balance: 1500000n, updatedAt: new Date("2025-10-15T10:00:00Z") }, // ₦15,000
  { id: 4, userId: 4, balance: 2100000n, updatedAt: new Date("2025-10-15T10:00:00Z") }, // ₦21,000
  { id: 5, userId: 5, balance: 800000n, updatedAt: new Date("2025-10-15T10:00:00Z") },  // ₦8,000
];

export const investmentCyclesData = [
  {
    id: 1,
    name: "May 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n, // ₦10,000
    startDate: new Date("2025-05-01"),
    endDate: new Date("2025-05-31"),
    totalProfitRealized: 5000000n, // Kobo (₦50,000)
    investorProfitPool: 4000000n,  // 80%
    organizationProfitShare: 1000000n, // 20%
    profitDistributionStatus: "completed",
  },
  {
    id: 2,
    name: "June 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-06-30"),
    totalProfitRealized: 6000000n,
    investorProfitPool: 4800000n,
    organizationProfitShare: 1200000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 3,
    name: "July 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-07-31"),
    totalProfitRealized: 7000000n,
    investorProfitPool: 5600000n,
    organizationProfitShare: 1400000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 4,
    name: "August 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: new Date("2025-08-01"),
    endDate: new Date("2025-08-31"),
    totalProfitRealized: 8000000n,
    investorProfitPool: 6400000n,
    organizationProfitShare: 1600000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 5,
    name: "September 2025 Cycle",
    status: "completed",
    pricePerShare: 1000000n,
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-09-30"),
    totalProfitRealized: 9000000n,
    investorProfitPool: 7200000n,
    organizationProfitShare: 1800000n,
    profitDistributionStatus: "completed",
  },
  {
    id: 6,
    name: "October 2025 Cycle",
    status: "active",
    pricePerShare: 1000000n,
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-31"),
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
    startDate: new Date("2025-11-01"),
    endDate: new Date("2025-11-30"),
    totalProfitRealized: 0n,
    investorProfitPool: 0n,
    organizationProfitShare: 0n,
    profitDistributionStatus: "pending",
  },
];

// Shareholder investments (some users invest every cycle, some skip, some invest large once)
export const shareholderInvestmentsData = [
  // Ahmad invests every cycle, steady investor
  { id: 1, userId: 1, cycleId: 1, shares: 10, amountInvested: 10000000n, profitEarned: 800000n, createdAt: new Date("2025-05-03T09:00:00Z") }, // ₦100,000
  { id: 2, userId: 1, cycleId: 2, shares: 12, amountInvested: 12000000n, profitEarned: 960000n, createdAt: new Date("2025-06-05T09:00:00Z") },
  { id: 3, userId: 1, cycleId: 3, shares: 8, amountInvested: 8000000n, profitEarned: 640000n, createdAt: new Date("2025-07-02T09:00:00Z") },
  { id: 4, userId: 1, cycleId: 4, shares: 15, amountInvested: 15000000n, profitEarned: 1200000n, createdAt: new Date("2025-08-04T09:00:00Z") },
  { id: 5, userId: 1, cycleId: 5, shares: 10, amountInvested: 10000000n, profitEarned: 800000n, createdAt: new Date("2025-09-06T09:00:00Z") },
  { id: 6, userId: 1, cycleId: 6, shares: 20, amountInvested: 20000000n, profitEarned: 0n, createdAt: new Date("2025-10-05T09:00:00Z") }, // active cycle

  // Ismail invests all cycles with moderate amounts
  { id: 7, userId: 2, cycleId: 1, shares: 5, amountInvested: 5000000n, profitEarned: 400000n, createdAt: new Date("2025-05-06T09:00:00Z") },
  { id: 8, userId: 2, cycleId: 2, shares: 6, amountInvested: 6000000n, profitEarned: 480000n, createdAt: new Date("2025-06-07T09:00:00Z") },
  { id: 9, userId: 2, cycleId: 3, shares: 6, amountInvested: 6000000n, profitEarned: 480000n, createdAt: new Date("2025-07-07T09:00:00Z") },
  { id: 10, userId: 2, cycleId: 4, shares: 7, amountInvested: 7000000n, profitEarned: 560000n, createdAt: new Date("2025-08-07T09:00:00Z") },
  { id: 11, userId: 2, cycleId: 5, shares: 8, amountInvested: 8000000n, profitEarned: 640000n, createdAt: new Date("2025-09-08T09:00:00Z") },
  { id: 12, userId: 2, cycleId: 6, shares: 10, amountInvested: 10000000n, profitEarned: 0n, createdAt: new Date("2025-10-08T09:00:00Z") },

  // Abubakar invests large once (June) and a small later
  { id: 13, userId: 3, cycleId: 2, shares: 50, amountInvested: 50000000n, profitEarned: 4000000n, createdAt: new Date("2025-06-02T09:00:00Z") }, // big investor
  { id: 14, userId: 3, cycleId: 5, shares: 3, amountInvested: 3000000n, profitEarned: 240000n, createdAt: new Date("2025-09-10T09:00:00Z") },

  // Aminu invests occasionally
  { id: 15, userId: 4, cycleId: 3, shares: 4, amountInvested: 4000000n, profitEarned: 320000n, createdAt: new Date("2025-07-05T09:00:00Z") },
  { id: 16, userId: 4, cycleId: 6, shares: 6, amountInvested: 6000000n, profitEarned: 0n, createdAt: new Date("2025-10-10T09:00:00Z") },

  // Usman is new / small investor
  { id: 17, userId: 5, cycleId: 4, shares: 2, amountInvested: 2000000n, profitEarned: 160000n, createdAt: new Date("2025-08-12T09:00:00Z") },
  { id: 18, userId: 5, cycleId: 6, shares: 3, amountInvested: 3000000n, profitEarned: 0n, createdAt: new Date("2025-10-12T09:00:00Z") },
];

export const transactionsData = [
  // Ahmad transactions: deposits, share purchases, profit distributions, withdrawal
  { id: 1, userId: 1, type: "deposit", amount: 20000000n, status: "completed", description: "Initial funding", relatedEntityType: null, relatedEntityId: null, createdAt: new Date("2025-04-29T08:00:00Z") },
  { id: 2, userId: 1, type: "share_purchase", amount: 10000000n, status: "completed", description: "May cycle purchase", relatedEntityType: "investment", relatedEntityId: 1, createdAt: new Date("2025-05-03T09:00:00Z") },
  { id: 3, userId: 1, type: "profit_distribution", amount: 800000n, status: "completed", description: "Profit for May 2025", relatedEntityType: "investment", relatedEntityId: 1, createdAt: new Date("2025-06-02T10:00:00Z") },
  { id: 4, userId: 1, type: "share_purchase", amount: 12000000n, status: "completed", description: "June cycle purchase", relatedEntityType: "investment", relatedEntityId: 2, createdAt: new Date("2025-06-05T09:00:00Z") },
  { id: 5, userId: 1, type: "withdrawal", amount: 500000n, status: "completed", description: "Partial withdrawal", relatedEntityType: "withdrawal", relatedEntityId: 1, createdAt: new Date("2025-07-15T09:00:00Z") },

  // Ismail transactions
  { id: 6, userId: 2, type: "deposit", amount: 10000000n, status: "completed", description: "Initial funding", relatedEntityType: null, relatedEntityId: null, createdAt: new Date("2025-05-01T09:00:00Z") },
  { id: 7, userId: 2, type: "share_purchase", amount: 5000000n, status: "completed", description: "May cycle purchase", relatedEntityType: "investment", relatedEntityId: 7, createdAt: new Date("2025-05-06T09:00:00Z") },
  { id: 8, userId: 2, type: "profit_distribution", amount: 400000n, status: "completed", description: "May profit", relatedEntityType: "investment", relatedEntityId: 7, createdAt: new Date("2025-06-03T09:00:00Z") },

  // Abubakar transactions
  { id: 9, userId: 3, type: "deposit", amount: 60000000n, status: "completed", description: "Large deposit for June", relatedEntityType: null, relatedEntityId: null, createdAt: new Date("2025-06-01T08:00:00Z") },
  { id: 10, userId: 3, type: "share_purchase", amount: 50000000n, status: "completed", description: "June bulk purchase", relatedEntityType: "investment", relatedEntityId: 13, createdAt: new Date("2025-06-02T09:00:00Z") },
  { id: 11, userId: 3, type: "profit_distribution", amount: 4000000n, status: "completed", description: "June profit", relatedEntityType: "investment", relatedEntityId: 13, createdAt: new Date("2025-07-05T09:00:00Z") },

  // Aminu transactions
  { id: 12, userId: 4, type: "deposit", amount: 5000000n, status: "completed", description: "Deposit for July", relatedEntityType: null, relatedEntityId: null, createdAt: new Date("2025-07-01T08:00:00Z") },
  { id: 13, userId: 4, type: "share_purchase", amount: 4000000n, status: "completed", description: "July purchase", relatedEntityType: "investment", relatedEntityId: 15, createdAt: new Date("2025-07-05T09:00:00Z") },

  // Usman transactions
  { id: 14, userId: 5, type: "deposit", amount: 3000000n, status: "completed", description: "August deposit", relatedEntityType: null, relatedEntityId: null, createdAt: new Date("2025-08-01T08:00:00Z") },
  { id: 15, userId: 5, type: "share_purchase", amount: 2000000n, status: "completed", description: "August purchase", relatedEntityType: "investment", relatedEntityId: 17, createdAt: new Date("2025-08-12T09:00:00Z") },

  // Some pending/failed
  { id: 16, userId: 1, type: "service_payment", amount: 25000n, status: "failed", description: "Subscription fee", relatedEntityType: null, relatedEntityId: null, createdAt: new Date("2025-10-01T10:00:00Z") },

  // Active cycle purchases (October)
  { id: 17, userId: 1, type: "share_purchase", amount: 20000000n, status: "completed", description: "October purchase", relatedEntityType: "investment", relatedEntityId: 6, createdAt: new Date("2025-10-05T09:00:00Z") },
  { id: 18, userId: 2, type: "share_purchase", amount: 10000000n, status: "completed", description: "October purchase", relatedEntityType: "investment", relatedEntityId: 12, createdAt: new Date("2025-10-08T09:00:00Z") },
];

export const businessVenturesData = [
  // May ventures
  {
    id: 1,
    cycleId: 1,
    managedBy: 1,
    companyName: "Zaria Agro Ventures",
    allocatedAmount: 30000000n,
    expectedProfit: 45000000n,
    profitRealized: 50000000n,
  },
  {
    id: 2,
    cycleId: 1,
    managedBy: 2,
    companyName: "Kano Food Processing",
    allocatedAmount: 20000000n,
    expectedProfit: 30000000n,
    profitRealized: 25000000n,
  },

  // June - more ventures
  {
    id: 3,
    cycleId: 2,
    managedBy: 2,
    companyName: "Arewa Logistics",
    allocatedAmount: 40000000n,
    expectedProfit: 50000000n,
    profitRealized: 60000000n,
  },
  {
    id: 4,
    cycleId: 2,
    managedBy: 1,
    companyName: "Abuja Agro Export",
    allocatedAmount: 25000000n,
    expectedProfit: 35000000n,
    profitRealized: 35000000n,
  },

  // July - more
  {
    id: 5,
    cycleId: 3,
    managedBy: 3,
    companyName: "Kaduna Poultry",
    allocatedAmount: 20000000n,
    expectedProfit: 30000000n,
    profitRealized: 32000000n,
  },

  // August - more ventures (growing)
  {
    id: 6,
    cycleId: 4,
    managedBy: 1,
    companyName: "Sokoto Textiles",
    allocatedAmount: 30000000n,
    expectedProfit: 40000000n,
    profitRealized: 42000000n,
  },
  {
    id: 7,
    cycleId: 4,
    managedBy: 4,
    companyName: "Sokoto Solar",
    allocatedAmount: 15000000n,
    expectedProfit: 22000000n,
    profitRealized: 18000000n,
  },

  // September - more ventures
  {
    id: 8,
    cycleId: 5,
    managedBy: 2,
    companyName: "Katsina Mills",
    allocatedAmount: 35000000n,
    expectedProfit: 48000000n,
    profitRealized: 50000000n,
  },
  {
    id: 9,
    cycleId: 5,
    managedBy: 1,
    companyName: "Zaria Cold Storage",
    allocatedAmount: 20000000n,
    expectedProfit: 30000000n,
    profitRealized: 32000000n,
  },

  // October (active) - new ventures added
  {
    id: 10,
    cycleId: 6,
    managedBy: 1,
    companyName: "Abuja AgriTech",
    allocatedAmount: 50000000n,
    expectedProfit: 70000000n,
    profitRealized: 0n,
  },
  {
    id: 11,
    cycleId: 6,
    managedBy: 2,
    companyName: "Northern Logistics",
    allocatedAmount: 30000000n,
    expectedProfit: 40000000n,
    profitRealized: 0n,
  },

  // November open_for_investment - placeholder ventures planned
  {
    id: 12,
    cycleId: 7,
    managedBy: 3,
    companyName: "Planned: Kaduna Cold Chain",
    allocatedAmount: 0n,
    expectedProfit: 0n,
    profitRealized: 0n,
  },
];

export const organizationalLedgerData = [
  // Income from profit shares for completed cycles recorded
  {
    id: 1,
    entryType: "income",
    source: "Organization's 20% share - May 2025 Cycle",
    amount: 1000000n,
    date: new Date("2025-06-01"),
    relatedCycleId: 1,
    recordedBy: 1,
    createdAt: new Date("2025-06-01T12:00:00Z"),
  },
  {
    id: 2,
    entryType: "income",
    source: "Organization's 20% share - June 2025 Cycle",
    amount: 1200000n,
    date: new Date("2025-07-01"),
    relatedCycleId: 2,
    recordedBy: 2,
    createdAt: new Date("2025-07-01T12:00:00Z"),
  },
  {
    id: 3,
    entryType: "expense",
    source: "Office rent - July 2025",
    amount: 250000n,
    date: new Date("2025-07-10"),
    relatedCycleId: null,
    recordedBy: 1,
    createdAt: new Date("2025-07-10T12:00:00Z"),
  },
  {
    id: 4,
    entryType: "income",
    source: "Organization's 20% share - September 2025 Cycle",
    amount: 1800000n,
    date: new Date("2025-10-01"),
    relatedCycleId: 5,
    recordedBy: 1,
    createdAt: new Date("2025-10-01T12:00:00Z"),
  },
];

export const userPreferencesData = [
  { id: 1, userId: 1, autoReinvest: false },
  { id: 2, userId: 2, autoReinvest: true },
  { id: 3, userId: 3, autoReinvest: false },
  { id: 4, userId: 4, autoReinvest: true },
  { id: 5, userId: 5, autoReinvest: false },
];

export const withdrawalRequestsData = [
  // Ahmad requested profit withdrawal from May profits
  {
    id: 1,
    userId: 1,
    amount: 800000n,
    withdrawalType: "profit_only",
    relatedCycleId: 1,
    status: "processed",
    requestedAt: new Date("2025-06-05T09:00:00Z"),
    approvedBy: 2,
    processedAt: new Date("2025-06-10T09:00:00Z"),
    rejectionReason: null,
  },
  // Ismail requested full divestment from a small cycle (later rejected)
  {
    id: 2,
    userId: 2,
    amount: 5000000n,
    withdrawalType: "full_divestment",
    relatedCycleId: 1,
    status: "rejected",
    requestedAt: new Date("2025-06-10T09:00:00Z"),
    approvedBy: null,
    processedAt: null,
    rejectionReason: "Cycle already distributed and reinvestment locked",
  },
  // Abubakar requested part of profit from June
  {
    id: 3,
    userId: 3,
    amount: 4000000n,
    withdrawalType: "profit_only",
    relatedCycleId: 2,
    status: "processed",
    requestedAt: new Date("2025-07-06T09:00:00Z"),
    approvedBy: 1,
    processedAt: new Date("2025-07-08T09:00:00Z"),
    rejectionReason: null,
  },
  // Usman pending withdrawal
  {
    id: 4,
    userId: 5,
    amount: 160000n,
    withdrawalType: "profit_only",
    relatedCycleId: 4,
    status: "pending",
    requestedAt: new Date("2025-09-15T10:00:00Z"),
    approvedBy: null,
    processedAt: null,
    rejectionReason: null,
  },
];

export const emergencyWithdrawalRequestsData = [
  {
    id: 1,
    userId: 4,
    reason: "Medical emergency - urgent surgery",
    amount: 500000n,
    status: "approved",
    requestedAt: new Date("2025-08-20T09:00:00Z"),
    processedAt: new Date("2025-08-22T09:00:00Z"),
  },
  {
    id: 2,
    userId: 5,
    reason: "Family emergency",
    amount: 300000n,
    status: "pending",
    requestedAt: new Date("2025-09-01T09:00:00Z"),
    processedAt: null,
  },
];

export const notificationsData = [
  {
    id: 1,
    userId: 1,
    title: "Profit distribution completed - May 2025",
    message: "Your profit for May 2025 has been distributed to your wallet.",
    isRead: false,
    link: "/wallet",
    createdAt: new Date("2025-06-02T12:00:00Z"),
  },
  {
    id: 2,
    userId: 2,
    title: "Withdrawal request rejected",
    message: "Your withdrawal request for May 2025 was rejected. See reason in withdrawals.",
    isRead: false,
    link: "/withdrawals/2",
    createdAt: new Date("2025-06-11T12:00:00Z"),
  },
  {
    id: 3,
    userId: 3,
    title: "Large profit credited",
    message: "Your profit for June 2025 has been credited.",
    isRead: true,
    link: "/wallet",
    createdAt: new Date("2025-07-05T12:00:00Z"),
  },
  {
    id: 4,
    userId: 5,
    title: "KYC pending review",
    message: "Your KYC documents are pending review. Please update if needed.",
    isRead: false,
    link: "/profile/5",
    createdAt: new Date("2025-05-04T12:00:00Z"),
  },
];

export const deceasedUserClaimsData = [
  // Example: no active deceased users, but include an example record (status pending_review)
  {
    id: 1,
    deceasedUserId: 99, // a hypothetical user not in the current set - frontend can still handle the shape
    claimantName: "Fatima Ahmed",
    claimantContact: "08070000000",
    status: "pending_review",
    deathCertificateUrl: "https://res.cloudinary.com/demo/image/upload/v1726854321/death_cert.jpg",
    adminNotes: null,
    processedBy: null,
    createdAt: new Date("2025-09-20T09:00:00Z"),
    updatedAt: null,
  },
];

