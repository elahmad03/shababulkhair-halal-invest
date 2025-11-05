import { InferModel } from "drizzle-orm";
import {
  users,
  userProfiles,
  wallets,
  transactions,
  investmentCycles,
  shareholderInvestments,
  businessVentures,
  organizationalLedger,
  userPreferences,
  withdrawalRequests,
  emergencyWithdrawalRequests,
  deceasedUserClaims,
  notifications,
  verificationTokens,
} from "@/db/schema"; 

// --- Infer Types ---
export type User = InferModel<typeof users, "select">;
export type UserProfile = InferModel<typeof userProfiles, "select">;
export type Wallet = InferModel<typeof wallets, "select">;
export type Transaction = InferModel<typeof transactions, "select">;
export type InvestmentCycle = InferModel<typeof investmentCycles, "select">;
export type ShareholderInvestment = InferModel<typeof shareholderInvestments, "select">;
export type BusinessVenture = InferModel<typeof businessVentures, "select">;
export type OrganizationalLedger = InferModel<typeof organizationalLedger, "select">;
export type Notification = InferModel<typeof notifications, "select">;
export type UserPreference = InferModel<typeof userPreferences, "select">;
export type WithdrawalRequest = InferModel<typeof withdrawalRequests, "select">;
export type EmergencyWithdrawalRequest = InferModel<typeof emergencyWithdrawalRequests, "select">;
export type DeceasedUserClaim = InferModel<typeof deceasedUserClaims, "select">;
export type VerificationTokens= InferModel<typeof verificationTokens, 'select'>;

export interface BusinessVentureWithDetails extends BusinessVenture {
  managerName: string
  cycleName: string
  status: "active" | "completed"
}
