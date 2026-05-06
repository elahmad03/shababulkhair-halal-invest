import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";
import {
  Venture,
  VentureSummary,
  CreateVentureRequest,
  UpdateVentureRequest,
  RecordVentureProfitRequest,
  RecordVentureProfitResponse,
  DeleteVentureResponse,
} from "./venture.types";

// ─── API ─────────────────────────────────────────────────────────────

export const ventureApi = rootApi.injectEndpoints({
  endpoints: (build) => ({

    // ─── QUERIES (Admin/Committee only) ──────────────────────────

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

    // ─── MUTATIONS (Admin/Committee only) ────────────────────────

    // POST /ventures
    // Create new venture
    createVenture: build.mutation<ApiResponse<Venture>, CreateVentureRequest>({
      query: (body) => ({
        url: `/ventures`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Ventures", id: arg.cycleId },
        "Cycles",
      ],
    }),

    // PATCH /ventures/:id
    // Update venture metadata
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
    // Record or update realized profit
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
  useGetVenturesByCycleQuery,
  useGetVentureByIdQuery,
  useCreateVentureMutation,
  useUpdateVentureMutation,
  useRecordVentureProfitMutation,
  useDeleteVentureMutation,
} = ventureApi;
