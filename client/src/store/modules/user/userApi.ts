import { rootApi } from "@/store/rootApi";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: "ADMIN" | "COMMITTEE" | "MEMBER";
  status: "ACTIVE" | "SUSPENDED" | "DECEASED";
  walletAddress?: string;
  avatarUrl?: string;
  createdAt: string;
  kyc?: {
    status: string;
    verificationDate?: string;
    avatarUrl?: string;
    idCardFrontUrl?: string;
    idCardBackUrl?: string;
    streetAddress?: string;
    city?: string;
    stateRegion?: string;
    countryCode?: string;
    dateOfBirth?: string;
    governmentIdType?: string;
    nextOfKinName?: string;
    nextOfKinRelationship?: string;
    nextOfKinPhone?: string;
  };
  _count?: {
    investments: number;
    ledgerEntries: number;
  };
}

export interface UserDetail extends User {
  updatedAt: string;
  wallet?: {
    id: string;
    balance: number;
    currency: string;
  };
}

export interface UserKyc {
  id: string;
  status: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  idType?: string;
  idNumber?: string;
  idDocumentUrl?: string;
  proofOfAddressUrl?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  verificationDate?: string;
  rejectionReason?: string;
  submissionDate?: string;
  createdAt: string;
  updatedAt: string;
  kycAuditLogs?: Array<{
    id: string;
    action: string;
    comment?: string;
    changedBy: string;
    createdAt: string;
  }>;
}

export interface Investment {
  id: string;
  ventureId: string;
  venture: {
    id: string;
    name: string;
    status: string;
  };
  cycleId: string;
  cycle: {
    id: string;
    name: string;
    status: string;
  };
  amount: number;
  sharesAcquired: number;
  investmentDate: string;
  status: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionHash: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  relatedVenture?: {
    id: string;
    name: string;
  };
  relatedCycle?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface ListUsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserTransactionsResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Every endpoint on this backend wraps its payload like:
 *   { success: boolean, data: T, message: string }
 * `unwrap` pulls `.data` out in `transformResponse` so components never
 * have to think about the envelope — `useGetMeQuery()` returns the user,
 * not `{ success, data, message }`.
 */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  return response.data;
}

export const userApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── List all users with filters
    listUsers: builder.query<
      ListUsersResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: string;
        kycStatus?: string;
      }
    >({
      query: (params) => ({
        url: "/users/admin/users",
        method: "GET",
        params,
      }),
      transformResponse: unwrap<ListUsersResponse>,
      providesTags: ["Users"],
    }),

    // ── Get user detail
    getUser: builder.query<UserDetail, string>({
      query: (id) => ({
        url: `/users/admin/users/${id}`,
        method: "GET",
      }),
      transformResponse: unwrap<UserDetail>,
      providesTags: ["Users"],
    }),

    // ── Get user KYC
    getUserKyc: builder.query<UserKyc, string>({
      query: (id) => ({
        url: `/users/admin/users/${id}/kyc`,
        method: "GET",
      }),
      transformResponse: unwrap<UserKyc>,
      providesTags: ["Users"],
    }),

    // ── Get user investments
    getUserInvestments: builder.query<Investment[], string>({
      query: (id) => ({
        url: `/users/admin/users/${id}/investments`,
        method: "GET",
      }),
      transformResponse: unwrap<Investment[]>,
      providesTags: ["Users"],
    }),

    // ── Get user transactions
    getUserTransactions: builder.query<
      UserTransactionsResponse,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page = 1, limit = 10 }) => ({
        url: `/users/admin/users/${id}/transactions`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: unwrap<UserTransactionsResponse>,
      providesTags: ["Users"],
    }),

    // ── Get current user profile
    getMe: builder.query<UserDetail, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      transformResponse: unwrap<UserDetail>,
      providesTags: ["Users"],
    }),

    // ── Update user status
    updateUserStatus: builder.mutation<
      UserDetail,
      { id: string; status: "ACTIVE" | "SUSPENDED" }
    >({
      query: ({ id, status }) => ({
        url: `/users/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: unwrap<UserDetail>,
      invalidatesTags: ["Users"],
    }),

  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useGetUserKycQuery,
  useGetUserInvestmentsQuery,
  useGetUserTransactionsQuery,
  useGetMeQuery,
  useUpdateUserStatusMutation,
} = userApi;