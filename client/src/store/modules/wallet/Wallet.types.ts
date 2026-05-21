// Re-export all wallet types from walletApi for convenience
export type {
  WalletBalance,
  WalletTransaction,
  WalletSummary,
  InitializeDepositRequest,
  InitializeDepositResponse,
  WithdrawRequest,
  WithdrawResponse,
  AdminAdjustRequest,
  AdminAdjustResponse,
  ResolveWithdrawalRequest,
  WithdrawalRecord,
  TransactionsResponse,
} from './walletApi';
