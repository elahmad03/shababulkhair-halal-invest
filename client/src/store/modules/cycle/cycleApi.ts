import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";
import type {
  Cycle,
  PaginatedCycles,
  MemberPosition,
  InvestmentHistory,
  CycleInvestmentsResponse,
  CreateCycleRequest,
  UpdateCycleRequest,
  UpdateCycleStatusRequest,
  PurchaseSharesRequest,
  PurchaseSharesResponse,
  DistributeProfitRequest,
  DistributeProfitResponse,
  CompleteCycleRequest,
} from "./cycle.types";

// ─── CYCLE API ───────────────────────────────────────────────────────────────

export const cycleApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // ─── QUERIES ─────────────────────────────────────────────────────

    // GET /cycles
    listCycles: build.query<
      ApiResponse<PaginatedCycles>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        let url = `/cycles?page=${page}&limit=${limit}`;
        if (params?.status) url += `&status=${params.status}`;
        return { url };
      },
      providesTags: ["Cycles"],
    }),

    // GET /cycles/:id
    getCycleById: build.query<ApiResponse<Cycle>, string>({
      query: (id) => ({
        url: `/cycles/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "Cycles", id }],
    }),

    // GET /cycles/:id/my-investment (with alias /my-position)
    getMemberPosition: build.query<ApiResponse<MemberPosition>, string>({
      query: (id) => ({
        url: `/cycles/${id}/my-investment`,
      }),
      providesTags: (_result, _error, id) => [
        { type: "Cycles", id },
        "Wallet",
      ],
    }),

    // GET /cycles/my-history
    getMemberInvestmentHistory: build.query<ApiResponse<InvestmentHistory[]>, void>({
      query: () => ({
        url: `/cycles/my-history`,
      }),
      providesTags: ["Cycles"],
    }),

    // GET /cycles/:id/investments (Admin)
    getCycleInvestments: build.query<
      ApiResponse<CycleInvestmentsResponse>,
      { cycleId: string; page?: number; limit?: number }
    >({
      query: ({ cycleId, page = 1, limit = 20 }) => ({
        url: `/cycles/${cycleId}/investments?page=${page}&limit=${limit}`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Cycles", id: arg.cycleId },
      ],
    }),

    // ─── MUTATIONS ───────────────────────────────────────────────────

    // POST /cycles/:id/invest
    purchaseShares: build.mutation<
      ApiResponse<PurchaseSharesResponse>,
      { cycleId: string; body: PurchaseSharesRequest }
    >({
      query: ({ cycleId, body }) => ({
        url: `/cycles/${cycleId}/invest`,
        method: "POST",
        body: {
          sharesRequested: body.sharesRequested ?? body.shares ?? body.quantity,
          idempotencyKey: body.idempotencyKey,
        },
        headers: body.idempotencyKey
          ? { "Idempotency-Key": body.idempotencyKey }
          : undefined,
      }),
      invalidatesTags: ["Cycles", "Wallet", "Transactions"],
    }),

    // POST /cycles (Admin)
    createCycle: build.mutation<ApiResponse<Cycle>, CreateCycleRequest>({
      query: (body) => ({
        url: `/cycles`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cycles"],
    }),

    // PATCH /cycles/:id (Admin - PENDING only)
    updateCycle: build.mutation<
      ApiResponse<Cycle>,
      { cycleId: string; body: UpdateCycleRequest }
    >({
      query: ({ cycleId, body }) => ({
        url: `/cycles/${cycleId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Cycles",
        { type: "Cycles", id: arg.cycleId },
      ],
    }),

    // PATCH /cycles/:id/status (Admin - forward status transitions)
    updateCycleStatus: build.mutation<
      ApiResponse<Cycle>,
      { cycleId: string; body: UpdateCycleStatusRequest }
    >({
      query: ({ cycleId, body }) => ({
        url: `/cycles/${cycleId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Cycles",
        { type: "Cycles", id: arg.cycleId },
        "Wallet",
        "Dashboard",
      ],
    }),

    // POST /cycles/:id/distribute-profit (Admin)
    distributeProfit: build.mutation<
      ApiResponse<DistributeProfitResponse>,
      { cycleId: string; body: DistributeProfitRequest }
    >({
      query: ({ cycleId, body }) => ({
        url: `/cycles/${cycleId}/distribute-profit`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Cycles",
        { type: "Cycles", id: arg.cycleId },
      ],
    }),

    // Status shortcuts (Admin)
    openCycle: build.mutation<ApiResponse<Cycle>, string>({
      query: (id) => ({
        url: `/cycles/${id}/open`,
        method: "PATCH",
      }),
      invalidatesTags: ["Cycles"],
    }),

    activateCycle: build.mutation<
      ApiResponse<Cycle>,
      { cycleId: string; durationDays?: number } | string
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.cycleId;
        const body = typeof arg === "string" ? {} : { durationDays: arg.durationDays };
        return {
          url: `/cycles/${id}/activate`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Cycles"],
    }),

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
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

// ─── Hooks ──────────────────────────────────────────────────────────

export const {
  useListCyclesQuery,
  useGetCycleByIdQuery,
  useGetMemberPositionQuery,
  useGetMemberInvestmentHistoryQuery,
  useGetCycleInvestmentsQuery,
  usePurchaseSharesMutation,
  useCreateCycleMutation,
  useUpdateCycleMutation,
  useUpdateCycleStatusMutation,
  useDistributeProfitMutation,
  useOpenCycleMutation,
  useActivateCycleMutation,
  useCompleteCycleMutation,
} = cycleApi;