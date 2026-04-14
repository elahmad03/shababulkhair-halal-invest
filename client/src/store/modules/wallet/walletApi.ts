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
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useInitializeDepositMutation,
  useRequestWithdrawalMutation,
  useGetWalletSummaryQuery,
} = walletApi;