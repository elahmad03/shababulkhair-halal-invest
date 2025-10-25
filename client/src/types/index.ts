// src/types/db.ts
// =======================================================
// FRONTEND TYPES (aligned with your Drizzle schema)
// =======================================================

export interface User {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  role: "member" | "committee" | "admin";
  status: "active" | "suspended" | "deceased";
  emailVerified?: string | null;
  createdAt: string;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  dateOfBirth?: string;
  kycStatus: "not_submitted" | "pending_review" | "verified" | "rejected";
  profilePictureUrl?: string;
  governmentIdType?: "national_id" | "drivers_license" | "passport" | "voters_card";
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhoneNumber: string;
}

export interface Wallet {
  id: number;
  userId: number;
  balance: bigint;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  type:
    | "deposit"
    | "share_purchase"
    | "capital_return"
    | "profit_distribution"
    | "withdrawal"
    | "service_payment"
    | "emergency_withdrawal";
  amount: bigint;
  status: "pending" | "completed" | "failed";
  description?: string;
  relatedEntityType?: "withdrawal" | "investment" | "expense_reimbursement" | "emergency_request";
  relatedEntityId?: number;
  createdAt: string;
}

export interface InvestmentCycle {
  id: number;
  name: string;
  status: "pending" | "open_for_investment" | "active" | "completed";
  pricePerShare: bigint;
  startDate?: string;
  endDate?: string;
  totalProfitRealized: bigint;
  investorProfitPool: bigint;
  organizationProfitShare: bigint;
  profitDistributionStatus: "pending" | "completed";
}

export interface ShareholderInvestment {
  id: number;
  userId: number;
  cycleId: number;
  shares: number;
  amountInvested: bigint;
  profitEarned: bigint;
  createdAt: string;
}

export interface BusinessVenture {
  id: number;
  cycleId: number;
  managedBy: number;
  companyName: string;
  allocatedAmount: bigint;
  expectedProfit: bigint;
  profitRealized: bigint;
}

export interface OrganizationalLedger {
  id: number;
  entryType: "income" | "expense";
  source: string;
  amount: bigint;
  date: string;
  relatedCycleId?: number;
  recordedBy: number;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: bigint;
  withdrawalType: "wallet_balance" | "full_divestment" | "profit_only";
  relatedCycleId?: number;
  status: "pending" | "approved" | "processed" | "rejected";
  requestedAt: string;
  approvedBy?: number;
  processedAt?: string;
  rejectionReason?: string;
}

export interface EmergencyWithdrawalRequest {
  id: number;
  userId: number;
  reason: string;
  amount: bigint;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface UserPreference {
  id: number;
  userId: number;
  autoReinvest: boolean;
}

export interface DeceasedUserClaim {
  id: number;
  deceasedUserId: number;
  claimantName: string;
  claimantContact: string;
  status:
    | "pending_review"
    | "documents_requested"
    | "approved_for_payout"
    | "completed"
    | "rejected";
  deathCertificateUrl?: string;
  adminNotes?: string;
  processedBy?: number;
  createdAt: string;
  updatedAt?: string;
}
