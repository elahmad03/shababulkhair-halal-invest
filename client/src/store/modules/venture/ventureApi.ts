import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";
import {
  Venture,
  VentureSummary,
  VentureListResponse,
  CreateVentureRequest,
  UpdateVentureRequest,
  RecordVentureProfitRequest,
  RecordVentureProfitResponse,
  DeleteVentureResponse,
  VentureProfitEntry,
  CreateProfitEntryRequest,
  CreateProfitEntryResponse,
  UpdateProfitEntryRequest,
  UploadReceiptRequest,
  AgreementReceiptResponse,
  VentureInvestorsResponse,
} from "./venture.types";

// ─── API ─────────────────────────────────────────────────────────────

export const ventureApi = rootApi.injectEndpoints({
  endpoints: (build) => ({

    // ─── QUERIES ─────────────────────────────────────────────────

    // GET /ventures
    // List all business ventures across the platform
    listVentures: build.query<ApiResponse<VentureListResponse>, { page?: number; limit?: number } | void>({
      query: (params) => {
        const page = params && "page" in params ? params.page : 1;
        const limit = params && "limit" in params ? params.limit : 20;
        return {
          url: `/ventures?page=${page}&limit=${limit}`,
        };
      },
      providesTags: ["Ventures"],
    }),

    // GET /ventures/cycle/:cycleId
    // Fetch all ventures for a cycle with summary
    getVenturesByCycle: build.query<ApiResponse<VentureSummary>, string>({
      query: (cycleId) => ({
        url: `/ventures/cycle/${cycleId}`,
      }),
      providesTags: (result, _error, cycleId) => [
        { type: "Ventures", id: cycleId },
      ],
    }),

    // GET /ventures/:id
    // Fetch single venture detail
    getVentureById: build.query<ApiResponse<Venture>, string>({
      query: (id) => ({
        url: `/ventures/${id}`,
      }),
      providesTags: (result, _error, id) => [
        { type: "Venture", id },
      ],
    }),

    // GET /ventures/:id/agreement-receipt
    // Any authenticated user can view agreement receipt details
    getAgreementReceipt: build.query<ApiResponse<AgreementReceiptResponse>, string>({
      query: (id) => ({
        url: `/ventures/${id}/agreement-receipt`,
      }),
      providesTags: (result, _error, id) => [
        { type: "Venture", id },
      ],
    }),

    // GET /ventures/:id/profit-entries
    // Committee reads own entries, Admin reads all entries
    getProfitEntries: build.query<ApiResponse<VentureProfitEntry[]>, string>({
      query: (ventureId) => ({
        url: `/ventures/${ventureId}/profit-entries`,
      }),
      providesTags: (result, _error, id) => [
        { type: "Venture", id },
      ],
    }),

    // GET /ventures/:id/investors
    // List investors for a venture's cycle
    getVentureInvestors: build.query<
      ApiResponse<VentureInvestorsResponse>,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page = 1, limit = 20 }) => ({
        url: `/ventures/${id}/investors?page=${page}&limit=${limit}`,
      }),
    }),

    // ─── MUTATIONS ───────────────────────────────────────────────

    // POST /ventures
    // Create new venture (Admin only)
    createVenture: build.mutation<ApiResponse<Venture>, CreateVentureRequest>({
      query: (body) => ({
        url: `/ventures`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Ventures", id: arg.cycleId },
        "Ventures",
        "Cycles",
      ],
    }),

    // PATCH /ventures/:id
    // Update venture metadata (Admin only)
    updateVenture: build.mutation<
      ApiResponse<Venture>,
      { id: string; body: UpdateVentureRequest }
    >({
      query: ({ id, body }) => ({
        url: `/ventures/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Venture", id: arg.id },
        "Ventures",
        "Cycles",
      ],
    }),

    // PATCH /ventures/:id/profit
    // Record or update realized profit flat amount (Admin only)
    recordVentureProfit: build.mutation<
      ApiResponse<RecordVentureProfitResponse>,
      { id: string; body: RecordVentureProfitRequest }
    >({
      query: ({ id, body }) => ({
        url: `/ventures/${id}/profit`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Venture", id: arg.id },
        "Ventures",
        "Cycles",
      ],
    }),

    // POST /ventures/:id/agreement-receipt
    // Upload or replace agreement receipt (Admin only)
    uploadAgreementReceipt: build.mutation<
      ApiResponse<Venture>,
      UploadReceiptRequest
    >({
      query: ({ ventureId, agreementReceiptUrl }) => ({
        url: `/ventures/${ventureId}/agreement-receipt`,
        method: "POST",
        body: { agreementReceiptUrl },
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Venture", id: arg.ventureId },
        "Ventures",
        "Cycles",
      ],
    }),

    // POST /ventures/:id/profit-entries
    // Committee or Admin records a profit installment entry
    createProfitEntry: build.mutation<
      ApiResponse<CreateProfitEntryResponse>,
      CreateProfitEntryRequest
    >({
      query: ({ ventureId, ...body }) => ({
        url: `/ventures/${ventureId}/profit-entries`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Venture", id: arg.ventureId },
        "Ventures",
        "Cycles",
      ],
    }),

    // PATCH /ventures/profit-entries/:entryId
    // Committee or Admin edits their profit entry
    updateProfitEntry: build.mutation<
      ApiResponse<any>,
      UpdateProfitEntryRequest
    >({
      query: ({ entryId, ...body }) => ({
        url: `/ventures/profit-entries/${entryId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Ventures", "Cycles"],
    }),

    // DELETE /ventures/:id
    // Delete venture (only if cycle is ACTIVE and profit is 0)
    deleteVenture: build.mutation<ApiResponse<DeleteVentureResponse>, string>({
      query: (id) => ({
        url: `/ventures/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: () => [
        "Ventures",
        "Cycles",
      ],
    }),

  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

// ─── Hooks ──────────────────────────────────────────────────────────

export const {
  useListVenturesQuery,
  useGetVenturesByCycleQuery,
  useGetVentureByIdQuery,
  useGetAgreementReceiptQuery,
  useGetProfitEntriesQuery,
  useGetVentureInvestorsQuery,
  useCreateVentureMutation,
  useUpdateVentureMutation,
  useRecordVentureProfitMutation,
  useUploadAgreementReceiptMutation,
  useCreateProfitEntryMutation,
  useUpdateProfitEntryMutation,
  useDeleteVentureMutation,
} = ventureApi;
