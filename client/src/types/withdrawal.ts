export type WithdrawalSource = 'wallet' | 'divest';
export type DivestmentType = 'profit_only' | 'full_divestment';

export interface WithdrawalFormData {
  source: WithdrawalSource;
  amount: string;
  cycleId?: number;
  divestmentType?: DivestmentType;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

// src/types/admin-withdrawal.ts
export type WithdrawalStatus = 'pending' | 'approved' | 'processed' | 'rejected';

export interface WithdrawalWithUser {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: bigint;
  withdrawalType: string;
  relatedCycleId: number | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  requestedAt: Date;
  approvedBy: number | null;
  processedAt: Date | null;
  rejectionReason: string | null;
  walletBalance?: bigint;
}