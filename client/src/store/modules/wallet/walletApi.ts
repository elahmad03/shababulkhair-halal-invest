import { rootApi } from "@/store/rootApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WalletBalance {
  balanceKobo: string;
  lockedBalanceKobo: string;
  totalKobo: string;
}

export interface WalletTransaction {
  id: string;
  transactionRef: string;
  transactionType: string;
  amountKobo: string;
  transactionStatus: string;
  narration: string | null;
  createdAt: string;
}

export interface WalletSummary {
  balanceKobo: string;
  lockedBalanceKobo: string;
  recentTransactions: WalletTransaction[];
}

export interface InitializeDepositRequest {
  amountKobo: number;
}

export interface InitializeDepositResponse {
  transactionRef: string;
  amountKobo: string;
  authorizationUrl: string;
  accessCode: string;
}

export interface WithdrawRequest {
  amountKobo: number;
  disbursementType: "WALLET_BALANCE" | "PROFIT_ONLY" | "FULL_DIVESTMENT";
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface WithdrawResponse {
  requestId: string;
  status: string;
  amountKobo: string;
}

export interface AdminAdjustRequest {
  userId: string;
  amountKobo: number;
  narration: string;
}

export interface AdminAdjustResponse {
  adjusted: boolean;
  transactionId: string;
  newBalance: string;
}

export interface ResolveWithdrawalRequest {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountKobo: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "APPROVED" | "TRANSFERRED" | "COMPLETED" | "REJECTED";
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface TransactionsResponse {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface ListWithdrawalsRequest {
  status?: "PENDING" | "APPROVED" | "TRANSFERRED" | "COMPLETED" | "REJECTED";
  page?: number;
  limit?: number;
}

export interface ListWithdrawalsResponse {
  data: WithdrawalRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const walletApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /api/wallet/me - Get authenticated user's wallet
    getMyWallet: build.query<{ data: WalletBalance }, void>({
      query: () => ({ url: "/wallet/me" }),
      providesTags: ["Wallet"],
    }),

    // GET /api/wallet/summary - Get wallet summary with recent transactions
    getWalletSummary: build.query<{ data: WalletSummary }, void>({
      query: () => ({ url: "/wallet/summary" }),
      providesTags: ["Wallet"],
    }),

    // POST /api/wallet/deposit/initialize - Initialize Paystack deposit
    initializeDeposit: build.mutation<{ data: InitializeDepositResponse }, InitializeDepositRequest>({
      query: (body) => ({ 
        url: "/wallet/deposit/initialize", 
        method: "POST", 
        body 
      }),
      invalidatesTags: ["Wallet"],
    }),

    // POST /api/wallet/withdraw - Request withdrawal
    requestWithdrawal: build.mutation<{ data: WithdrawResponse }, WithdrawRequest>({
      query: (body) => ({ 
        url: "/wallet/withdraw", 
        method: "POST", 
        body 
      }),
      invalidatesTags: ["Wallet"],
    }),

    // GET /api/wallet/transactions - Get transaction history
    getTransactions: build.query<
      { data: TransactionsResponse },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/wallet/transactions?page=${page}&limit=${limit}`,
      }),
      providesTags: ["Wallet"],
    }),

    // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────
    
    // GET /api/wallet/admin/:userId - Get user's wallet as admin
    getAdminWallet: build.query<{ data: WalletBalance }, string>({
      query: (userId) => ({ url: `/wallet/admin/${userId}` }),
      providesTags: ["Wallet"],
    }),

    // POST /api/wallet/admin/adjust - Admin manual wallet adjustment
    adminAdjust: build.mutation<{ data: AdminAdjustResponse }, AdminAdjustRequest>({
      query: (body) => ({
        url: "/wallet/admin/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),

    // POST /api/wallet/admin/withdrawals/:id/resolve - Resolve withdrawal request
    resolveWithdrawal: build.mutation<
      { data: WithdrawalRecord },
      { id: string; body: ResolveWithdrawalRequest }
    >({
      query: ({ id, body }) => ({
        url: `/wallet/admin/withdrawals/${id}/resolve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "Withdrawals", "Dashboard"],
    }),

    // GET /api/wallet/admin/withdrawals - List withdrawal requests
    listWithdrawals: build.query<
      { data: ListWithdrawalsResponse },
      ListWithdrawalsRequest
    >({
      query: ({ status, page = 1, limit = 20 }) => {
        let url = `/wallet/admin/withdrawals?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return { url };
      },
      providesTags: ["Withdrawals"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useGetMyWalletQuery,
  useGetWalletSummaryQuery,
  useInitializeDepositMutation,
  useRequestWithdrawalMutation,
  useGetTransactionsQuery,
  useGetAdminWalletQuery,
  useAdminAdjustMutation,
  useResolveWithdrawalMutation,
  useListWithdrawalsQuery,
} = walletApi;