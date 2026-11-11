import { rootApi } from "@/store/rootApi";
import type {
  User,
  UserDetail,
  UserKyc,
  Investment,
  Transaction,
  ListUsersResponse,
  UserTransactionsResponse,
  EditUserInput,
} from "./User.types";

export type {
  UserRole,
  AccountStatus,
  KycStatusType,
  EditUserInput,
  UserEditLogItem,
  KycVersionItem,
  User,
  UserDetail,
  UserKyc,
  Investment,
  Transaction,
  ListUsersResponse,
  UserTransactionsResponse,
} from "./User.types";

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

    // ── Edit user details (Admin only)
    editUser: builder.mutation<
      UserDetail,
      { id: string; data: EditUserInput }
    >({
      query: ({ id, data }) => ({
        url: `/users/admin/users/${id}`,
        method: "PATCH",
        body: data,
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
  useEditUserMutation,
} = userApi;
