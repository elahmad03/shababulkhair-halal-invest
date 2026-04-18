import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";
import { CompleteCycleRequest, CreateCycleRequest, CreateVentureRequest, Cycle, InvestmentHistory, LedgerEntryRequest, MemberPosition, PaginatedCycles, PurchaseSharesRequest, PurchaseSharesResponse, RecordVentureProfitRequest } from "./cycle.types";

// ─── API ─────────────────────────────────────────────────────────────

export const cycleApi = rootApi.injectEndpoints({
  endpoints: (build) => ({

    // ─── PUBLIC ─────────────────────────────────────────────────────

    // GET /cycles
    listCycles: build.query<ApiResponse<PaginatedCycles>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/cycles?page=${page}&limit=${limit}`,
      }),
      providesTags: ["Cycles"],
    }),

    // GET /cycles/:id
    getCycleById: build.query<ApiResponse<Cycle>, string>({
      query: (id) => ({
        url: `/cycles/${id}`,
      }),
    }),

    // GET /cycles/:id/my-position
    getMemberPosition: build.query<ApiResponse<MemberPosition>, string>({
      query: (id) => ({
        url: `/cycles/${id}/my-position`,
      }),
    }),

    // GET /cycles/my-history
    getMemberInvestmentHistory: build.query<ApiResponse<InvestmentHistory[]>, void>({
      query: () => ({
        url: `/cycles/my-history`,
      }),
    }),

    // POST /cycles/:id/shares/purchase
    purchaseShares: build.mutation<
      ApiResponse<PurchaseSharesResponse>,
      { cycleId: string; body: PurchaseSharesRequest }
    >({
      query: ({ cycleId, body }) => ({
        url: `/cycles/${cycleId}/shares/purchase`,
        method: "POST",
        body,
        headers: {
          "Idempotency-Key": body.idempotencyKey,
        },
      }),
      invalidatesTags: ["Cycles", "Wallet"],
    }),

    // ─── ADMIN ──────────────────────────────────────────────────────

    // POST /cycles
    createCycle: build.mutation<ApiResponse<Cycle>, CreateCycleRequest>({
      query: (body) => ({
        url: `/cycles`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cycles"],
    }),

    // PATCH /cycles/:id/open
    openCycle: build.mutation<ApiResponse<Cycle>, string>({
      query: (id) => ({
        url: `/cycles/${id}/open`,
        method: "PATCH",
      }),
      invalidatesTags: ["Cycles"],
    }),

    // PATCH /cycles/:id/activate
    activateCycle: build.mutation<ApiResponse<Cycle>, string>({
      query: (id) => ({
        url: `/cycles/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Cycles"],
    }),

    // PATCH /cycles/:id/complete
    completeCycle: build.mutation<
      ApiResponse<Cycle>,
      { cycleId: string; body: CompleteCycleRequest }
    >({
      query: ({ cycleId, body }) => ({
        url: `/cycles/${cycleId}/complete`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cycles", "Wallet"],
    }),

    // POST /cycles/:id/ventures
    createVenture: build.mutation<
      ApiResponse<any>,
      { cycleId: string; body: CreateVentureRequest }
    >({
      query: ({ cycleId, body }) => ({
        url: `/cycles/${cycleId}/ventures`,
        method: "POST",
        body,
      }),
    }),

    // PATCH /cycles/ventures/:ventureId/profit
    recordVentureProfit: build.mutation<
      ApiResponse<any>,
      { ventureId: string; body: RecordVentureProfitRequest }
    >({
      query: ({ ventureId, body }) => ({
        url: `/cycles/ventures/${ventureId}/profit`,
        method: "PATCH",
        body,
      }),
    }),

    // POST /cycles/ledger
    recordLedgerEntry: build.mutation<ApiResponse<any>, LedgerEntryRequest>({
      query: (body) => ({
        url: `/cycles/ledger`,
        method: "POST",
        body,
      }),
    }),

  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

// ─── Hooks ──────────────────────────────────────────────────────────

export const {
  useListCyclesQuery,
  useGetCycleByIdQuery,
  useGetMemberPositionQuery,
  useGetMemberInvestmentHistoryQuery,
  usePurchaseSharesMutation,

  useCreateCycleMutation,
  useOpenCycleMutation,
  useActivateCycleMutation,
  useCompleteCycleMutation,
  useCreateVentureMutation,
  useRecordVentureProfitMutation,
  useRecordLedgerEntryMutation,
} = cycleApi;