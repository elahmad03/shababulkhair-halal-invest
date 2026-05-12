import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardKpiData {
  totalCapitalUnderManagement: string; // Kobo
  totalProfitDistributed: string; // Kobo
  activeInvestors: number;
  pendingWithdrawals: number;
}

export interface CycleWithProgress {
  id: string;
  cycleName: string;
  status: "PENDING" | "OPEN_FOR_INVESTMENT" | "ACTIVE" | "COMPLETED";
  capitalTargetKobo: string;
  capitalRaisedKobo: string;
  investorCount: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  progress: number; // 0-100
}

export interface ActivityLog {
  id: string;
  type: "registration" | "investment" | "withdrawal" | "kyc_approved";
  userId: string;
  userName: string;
  description: string;
  amountKobo?: string;
  timestamp: string;
}

export interface PendingTasksData {
  pendingWithdrawalsCount: number;
  pendingKycCount: number;
  pendingLedgerEntriesCount: number;
}

export interface WalletSnapshot {
  totalBalanceKobo: string;
  totalLockedKobo: string;
  recentTransactionsCount: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const dashboardApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /admin/dashboard/kpi
    // Returns high-level metrics for the dashboard KPI cards
    getDashboardKpi: build.query<ApiResponse<DashboardKpiData>, void>({
      query: () => ({
        url: "/admin/dashboard/kpi",
      }),
      providesTags: ["Dashboard"],
    }),

    // GET /admin/dashboard/current-cycle
    // Returns the current active cycle with progress info
    getCurrentCycleDetails: build.query<ApiResponse<CycleWithProgress>, void>({
      query: () => ({
        url: "/admin/dashboard/current-cycle",
      }),
      providesTags: ["Dashboard", "Cycles"],
    }),

    // GET /admin/dashboard/recent-activities?limit=10
    // Returns recent platform activities (registrations, investments, withdrawals, KYC approvals)
    getRecentActivities: build.query<ApiResponse<ActivityLog[]>, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/admin/dashboard/recent-activities?limit=${limit}`,
      }),
      providesTags: ["Dashboard"],
    }),

    // GET /admin/dashboard/pending-tasks
    // Returns counts of pending tasks (withdrawals, KYC, ledger entries)
    getPendingTasks: build.query<ApiResponse<PendingTasksData>, void>({
      query: () => ({
        url: "/admin/dashboard/pending-tasks",
      }),
      providesTags: ["Dashboard"],
    }),

    // GET /admin/dashboard/wallet-snapshot
    // Returns overall wallet metrics (total balance, locked funds, recent transaction count)
    getWalletSnapshot: build.query<ApiResponse<WalletSnapshot>, void>({
      query: () => ({
        url: "/admin/dashboard/wallet-snapshot",
      }),
      providesTags: ["Dashboard", "Wallet"],
    }),

    // GET /admin/withdrawals/pending?limit=5
    // Returns list of pending withdrawal requests (for quick access)
    getPendingWithdrawals: build.query<
      ApiResponse<{
        id: string;
        userId: string;
        userName: string;
        amountKobo: string;
        status: string;
        requestedAt: string;
      }[]>,
      { limit?: number }
    >({
      query: ({ limit = 5 }) => ({
        url: `/admin/withdrawals/pending?limit=${limit}`,
      }),
      providesTags: ["Dashboard"],
    }),

    // GET /kyc/pending?limit=5
    // Returns list of pending KYC submissions (for quick access)
    getPendingKyc: build.query<
      ApiResponse<{
        id: string;
        userId: string;
        userName: string;
        email: string;
        submittedAt: string;
        status: string;
      }[]>,
      { limit?: number }
    >({
      query: ({ limit = 5 }) => ({
        url: `/kyc/pending?limit=${limit}`,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const {
  useGetDashboardKpiQuery,
  useGetCurrentCycleDetailsQuery,
  useGetRecentActivitiesQuery,
  useGetPendingTasksQuery,
  useGetWalletSnapshotQuery,
  useGetPendingWithdrawalsQuery,
  useGetPendingKycQuery,
} = dashboardApi;
