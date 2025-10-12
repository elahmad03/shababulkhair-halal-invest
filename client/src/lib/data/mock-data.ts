
// --- 1. USER & PROFILE DATA ---

export const users = [
  { id: 1, fullName: 'Abubakar Mohammed', email: 'abubakar.m@example.com', role: 'committee', emailVerified: new Date() },
  { id: 2, fullName: 'Aminu Usman Mohammed', email: 'aminu.u@example.com', role: 'admin', emailVerified: new Date() },
  { id: 3, fullName: 'Sani Mohammed', email: 'sani.m@example.com', role: 'committee', emailVerified: new Date() },
  { id: 4, fullName: 'Ismail Lawal', email: 'ismail.l@example.com', role: 'committee', emailVerified: new Date() },
  { id: 5, fullName: 'Muhammad Nasiru', email: 'nasiru.m@example.com', role: 'member', emailVerified: new Date() },
  { id: 6, fullName: 'Abdulhamid Ibrahim', email: 'abdulhamid.i@example.com', role: 'member', emailVerified: new Date() },
  { id: 7, fullName: 'Lawan Gambo', email: 'lawan.g@example.com', role: 'member', emailVerified: new Date() },
  { id: 8, fullName: 'Fatima Gambo', email: 'fatima.g@example.com', role: 'member', emailVerified: new Date() },
  { id: 9, fullName: 'Ahmad Ibrahim', email: 'ahmad.i@example.com', role: 'admin', emailVerified: new Date() },
];

export const userProfiles = [
  { userId: 1, country: 'Nigeria', governmentIdNumber: '123456789', dateOfBirth: new Date('1985-05-10') },
  { userId: 2, country: 'Nigeria', governmentIdNumber: '987654321', dateOfBirth: new Date('1990-11-20') },
  { userId: 3, country: 'Nigeria', governmentIdNumber: '112233445', dateOfBirth: new Date('1988-02-15') },
  { userId: 5, country: 'Nigeria', governmentIdNumber: '121212121', dateOfBirth: new Date('1992-07-30') },
  // ... other profiles
];

// --- 2. FINANCIAL & INVESTMENT DATA ---

export const wallets = [
  { userId: 1, balance: 724205.56 },
  { userId: 2, balance: 886082.20 },
  { userId: 3, balance: 50000.00 }, // Has some funds for the next cycle
  { userId: 5, balance: 55661.19 },
  { userId: 6, balance: 425640.58 },
  { userId: 7, balance: 17331.44 },
  // ... other wallets
];

export const investmentCycles = [
  { id: 1, name: 'August Cycle 2025', status: 'completed' },
  { id: 2, name: 'September Cycle 2025', status: 'active' },
  { id: 3, name: 'October Cycle 2025', status: 'open_for_investment' },
];

export const shareholderInvestments = [
  // --- August Cycle (Completed) ---
  { id: 101, userId: 5, cycleId: 1, shares: 4, amountInvested: 50270.76, profitEarned: 5390.43 },
  { id: 102, userId: 6, cycleId: 1, shares: 33, amountInvested: 384419.99, profitEarned: 41220.59 },
  { id: 103, userId: 7, cycleId: 1, shares: 1, amountInvested: 15653.00, profitEarned: 1678.44 },
  { id: 104, userId: 1, cycleId: 1, shares: 55, amountInvested: 654070.84, profitEarned: 70134.72 },
  { id: 105, userId: 2, cycleId: 1, shares: 79, amountInvested: 800270.76, profitEarned: 85811.44 },
  // --- September Cycle (Active) ---
  { id: 201, userId: 3, cycleId: 2, shares: 200, amountInvested: 2000000.00, profitEarned: 0.00 },
  { id: 202, userId: 4, cycleId: 2, shares: 100, amountInvested: 1000000.00, profitEarned: 0.00 },
  { id: 203, userId: 1, cycleId: 2, shares: 265, amountInvested: 2659572.00, profitEarned: 0.00 },
];

// --- 3. ADMIN & ORGANIZATIONAL DATA ---

export const businessVentures = [
  { id: 1, cycleId: 1, managedBy: 1, companyName: 'August General Investment', allocatedAmount: 2659572.00, expectedProfit:200000.00, profitRealized: 250000.00 },
  { id: 2, cycleId: 2, managedBy: 3, companyName: 'Sensor and Key Sales', allocatedAmount: 2000000.00, expectedProfit: 0.00, profitRealized: 0.00 },
  { id: 3, cycleId: 2, managedBy: 4, companyName: 'Food & Battery Supply', allocatedAmount: 1000000.00, expectedProfit: 0.00, profitRealized: 0.00 },
];

export const organizationalExpenses = [
  { id: 1, description: 'Form and hand card', amount: 32000.00, date: new Date('2025-01-05'), recordedBy: 2 },
  { id: 2, description: 'Cac certificate', amount: 60000.00, date: new Date('2025-01-05'), recordedBy: 2 },
  { id: 3, description: 'Hosting', amount: 173500.00, date: new Date('2025-07-07'), recordedBy: 1 },
  { id: 4, description: 'Tin and stamp', amount: 10000.00, date: new Date('2025-07-10'), recordedBy: 1 },
];

// Using the improved schema for multiple contributors
export const expenseContributions = [
  { expenseId: 1, userId: 1, amountContributed: 32000.00, reimbursementStatus: 'reimbursed' },
  // For the 60k CAC certificate, split between 3 people
  { expenseId: 2, userId: 1, amountContributed: 20000.00, reimbursementStatus: 'reimbursed' },
  { expenseId: 2, userId: 2, amountContributed: 20000.00, reimbursementStatus: 'reimbursed' },
  { expenseId: 2, userId: 9, amountContributed: 20000.00, reimbursementStatus: 'reimbursed' },
  // For hosting
  { expenseId: 3, userId: 1, amountContributed: 173500.00, reimbursementStatus: 'reimbursed' },
  // For Tin and Stamp, still pending
  { expenseId: 4, userId: 2, amountContributed: 10000.00, reimbursementStatus: 'pending' },
];

export const withdrawalRequests = [
    { 
        id: 1, 
        userId: 9, 
        amount: 3748.00, 
        withdrawalType: 'profit_only', 
        relatedCycleId: 1, 
        status: 'processed', 
        requestedAt: new Date('2025-09-06T10:00:00Z'),
        approvedBy: 1,
        processedAt: new Date('2025-09-07T12:00:00Z'),
    },
    { 
        id: 2, 
        userId: 7, 
        amount: 17331.44, 
        withdrawalType: 'full_divestment', 
        relatedCycleId: 1, 
        status: 'approved', 
        requestedAt: new Date('2025-10-10T14:30:00Z'),
        approvedBy: 2,
        processedAt: null,
    },
    { 
        id: 3, 
        userId: 6, 
        amount: 50000.00, 
        withdrawalType: 'wallet_balance', 
        relatedCycleId: null, 
        status: 'pending', 
        requestedAt: new Date('2025-10-11T16:20:00Z'),
        approvedBy: null,
        processedAt: null,
    },
    { 
        id: 4, 
        userId: 5, 
        amount: 25000.00, 
        withdrawalType: 'wallet_balance', 
        relatedCycleId: null, 
        status: 'rejected', 
        requestedAt: new Date('2025-10-09T09:00:00Z'),
        approvedBy: 1,
        processedAt: null,
        rejectionReason: 'KYC information is incomplete.',
    },
];