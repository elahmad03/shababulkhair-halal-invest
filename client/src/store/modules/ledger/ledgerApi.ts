import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";
import {
  Transaction,
  TransactionDetail,
  MemberLedgerResponse,
  MemberSummary,
  OrgLedgerEntry,
  OrgLedgerResponse,
  GetMemberLedgerFilters,
  GetOrgLedgerFilters,
  RecordOrgEntryRequest,
} from "./ledger.types";

// ─── API ─────────────────────────────────────────────────────────────

export const ledgerApi = rootApi.injectEndpoints({
  endpoints: (build) => ({

    // ─── MEMBER QUERIES (Any authenticated user) ────────────────

    // GET /ledger
    // Fetch member's paginated transaction history with optional filters
    getMemberLedger: build.query<
      ApiResponse<MemberLedgerResponse>,
      GetMemberLedgerFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.type) params.append("type", filters.type);
        if (filters.status) params.append("status", filters.status);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());

        return {
          url: `/ledger?${params.toString()}`,
        };
      },
      providesTags: ["Ledger"],
    }),

    // GET /ledger/summary
    // Fetch wallet balance and lifetime category totals
    getMemberSummary: build.query<ApiResponse<MemberSummary>, void>({
      query: () => ({
        url: `/ledger/summary`,
      }),
      providesTags: ["Wallet"],
    }),

    // GET /ledger/transactions/:id
    // Fetch single transaction detail
    getTransactionById: build.query<ApiResponse<TransactionDetail>, string>({
      query: (id) => ({
        url: `/ledger/transactions/${id}`,
      }),
      providesTags: (result, _error, id) => [
        { type: "Transaction", id },
      ],
    }),

    // ─── ADMIN QUERIES ──────────────────────────────────────────

    // GET /ledger/org
    // Fetch organizational income/expense entries (admin only)
    getOrgLedger: build.query<
      ApiResponse<OrgLedgerResponse>,
      GetOrgLedgerFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.cycleId) params.append("cycleId", filters.cycleId);
        if (filters.entryType) params.append("entryType", filters.entryType);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());

        return {
          url: `/ledger/org?${params.toString()}`,
        };
      },
      providesTags: ["OrgLedger"],
    }),

    // ─── ADMIN MUTATIONS ────────────────────────────────────────

    // POST /ledger/org
    // Record new organizational income/expense entry (admin only)
    recordOrgEntry: build.mutation<
      ApiResponse<OrgLedgerEntry>,
      RecordOrgEntryRequest
    >({
      query: (body) => ({
        url: `/ledger/org`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrgLedger", "Cycles"],
    }),

  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

// ─── Hooks ──────────────────────────────────────────────────────────

export const {
  useGetMemberLedgerQuery,
  useGetMemberSummaryQuery,
  useGetTransactionByIdQuery,
  useGetOrgLedgerQuery,
  useRecordOrgEntryMutation,
} = ledgerApi;
