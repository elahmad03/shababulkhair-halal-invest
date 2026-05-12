import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DepositRequest {
  amount: number; // In Naira (converted to Kobo on backend)
}

export interface DepositResponse {
  transactionRef: string;
  amountKobo: string;
  authorizationUrl: string;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  idempotencyKey: string; 
}

export interface WithdrawResponse {
  requestId: string;
  status: string;
  amountKobo: string;
}

export interface WalletSummary {
  balanceKobo: string;
  lockedBalanceKobo: string;
  recentTransactions: Array<{
    id: string;
    transactionType: string;
    amountKobo: string;
    transactionStatus: string;
    createdAt: string;
  }>;
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
  status: "PENDING" | "APPROVED" | "PROCESSED" | "REJECTED";
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface ResolveWithdrawalRequest {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const walletApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // Initialize a deposit to get the Paystack/Gateway URL
    initializeDeposit: build.mutation<ApiResponse<DepositResponse>, DepositRequest>({
      query: (body) => ({ 
        url: "/wallet/deposit/initialize", 
        method: "POST", 
        body 
      }),
    }),

    // Request a manual withdrawal (quarantines funds)
    requestWithdrawal: build.mutation<ApiResponse<WithdrawResponse>, WithdrawRequest>({
      query: (body) => ({ 
        url: "/wallet/withdraw", 
        method: "POST", 
        body 
      }),
      // Invalidates wallet cache so the UI updates to show the locked balance immediately
      invalidatesTags: ["Wallet"], 
    }),

    // Get the user's current wallet status (balances and recent transactions)
    getWalletSummary: build.query<ApiResponse<WalletSummary>, void>({
      query: () => ({ url: "/wallet/summary" }),
      providesTags: ["Wallet"],
    }),

    // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────
    
    // GET /admin/withdrawals - List all withdrawal requests with optional filtering
    listWithdrawals: build.query<
      ApiResponse<{
        data: WithdrawalRecord[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>,
      { status?: string; page?: number; limit?: number }
    >({
      query: ({ status, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return {
          url: `/admin/withdrawals?${params.toString()}`,
        };
      },
      providesTags: ["Withdrawals"],
    }),

    // PATCH /admin/withdrawals/:id/resolve - Approve or reject a withdrawal
    resolveWithdrawal: build.mutation<
      ApiResponse<WithdrawalRecord>,
      { id: string; body: ResolveWithdrawalRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/withdrawals/${id}/resolve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Withdrawals", "Dashboard"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useInitializeDepositMutation,
  useRequestWithdrawalMutation,
  useGetWalletSummaryQuery,
  useListWithdrawalsQuery,
  useResolveWithdrawalMutation,
} = walletApi;