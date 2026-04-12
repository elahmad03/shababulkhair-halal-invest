import { rootApi } from "@/store/rootApi";
import type { ApiResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type KycUploadType = "front" | "back" | "avatar";

export type KycStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
  allowed_formats: string[];
  type: "authenticated";
  cloud_name: string;
  api_key: string;
}

export interface SubmitKycRequest {
  // Images
  idCardFrontUrl: string;
  idCardBackUrl: string;
  avatarUrl: string;
  // Personal
  dateOfBirth: string;         // "YYYY-MM-DD"
  governmentIdType: string;
  // Address
  streetAddress: string;
  city: string;
  stateRegion: string;
  countryCode: string;
  // Next of kin
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
}

export interface KycProfile {
  id: string;
  userId: string;
  version: number;
  isActive: boolean;
  kycStatus: KycStatus;
  streetAddress: string | null;
  city: string | null;
  stateRegion: string | null;
  countryCode: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  governmentIdType: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const kycApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    // Get a Cloudinary upload signature for a specific document type
    getUploadSignature: build.query<
      ApiResponse<UploadSignatureResponse>,
      KycUploadType
    >({
      query: (type) => ({ url: `/kyc/signature?type=${type}` }),
      keepUnusedDataFor: 0,
    }),

    // Submit the completed KYC form
    submitKyc: build.mutation<ApiResponse<KycProfile>, SubmitKycRequest>({
      query: (body) => ({ url: "/kyc", method: "POST", body }),
      invalidatesTags: ["Kyc"],
    }),

    // Get the current user's KYC record
    getMyKyc: build.query<ApiResponse<KycProfile>, void>({
      query: () => ({ url: "/kyc/me" }),
      providesTags: ["Kyc"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useLazyGetUploadSignatureQuery,
  useSubmitKycMutation,
  useGetMyKycQuery,
} = kycApi;