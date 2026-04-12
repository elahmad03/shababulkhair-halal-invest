import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";
import type { KycProfile } from "@/store/modules/kyc/kycApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingKycItem {
  id: string;
  userId: string;
  version: number;
  kycStatus: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface KycDetailResponse extends KycProfile {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminKycApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // List all pending KYC submissions
    getPendingKyc: build.query<ApiResponse<PendingKycItem[]>, void>({
      query: () => ({ url: "/kyc/pending" }),
      providesTags: ["Kyc"],
    }),

    // Get full KYC detail with signed image URLs
    getKycDetail: build.query<ApiResponse<KycDetailResponse>, string>({
      query: (kycId) => ({ url: `/kyc/${kycId}` }),
      providesTags: (_result, _error, kycId) => [{ type: "Kyc", id: kycId }],
    }),

    // Approve a KYC submission
    approveKyc: build.mutation<ApiResponse<KycProfile>, string>({
      query: (kycId) => ({
        url: `/kyc/approve/${kycId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Kyc"],
    }),

    // Reject a KYC submission
    rejectKyc: build.mutation<ApiResponse<KycProfile>, { kycId: string; reason: string }>({
      query: ({ kycId, reason }) => ({
        url: `/kyc/reject/${kycId}`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Kyc"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useGetPendingKycQuery,
  useGetKycDetailQuery,
  useApproveKycMutation,
  useRejectKycMutation,
} = adminKycApi;