// ============================================================
// BASE API WRAPPER — matches successResponse / errorResponse helpers
// ============================================================

export type Role = "USER" | "MEMBER" | "COMMITEE" | "ADMIN";

export type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]> | { stack?: string };
}
export interface ApiError {
  status?: number | string;
  data?: {
    message?: string;
    // You can uncomment or add other fields if your API returns them:
    // success?: boolean;
    // errors?: Record<string, string[]>; // For validation errors
  };
}
// ============================================================
// USER
// ============================================================
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Returned from login / verifyOtp — subset of User
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}

// ============================================================
// AUTH
// ============================================================
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Login returns either full auth or needs verification
export type LoginResponse =
  | {
      message: string;
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }
  | {
      message: string;
      needVerification: true;
      userId: string;
    };

export interface OtpVerifyRequest {
  userId: string;
  otp: string;
  purpose?: OtpPurpose;
}

export interface OtpVerifyResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
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
