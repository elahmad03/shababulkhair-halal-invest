export interface WalletState {
  balance: number;
  tier: number;
  walletId: string | null;
  transactions: Transaction[];
  pagination: Pagination;
  funding: FundingState;
  loading: LoadingState;
  error: string | null;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'FUNDING';
  reference: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  provider?: string;
  narration?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FundingState {
  loading: boolean;
  checkoutUrl: string | null;
  reference: string | null;
  amount: number;
  status: string | null;
}

export interface LoadingState {
  balance: boolean;
  transactions: boolean;
  verify: boolean;
}

export interface InitializeFundingPayload {
  amount: number;
}

export interface VerifyFundingPayload {
  reference: string;
}

export interface GetTransactionsPayload {
  page?: number;
  limit?: number;
  type?: string;
}