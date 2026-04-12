import { rootApi } from "@/store/rootApi";
import { setCredentials, clearCredentials } from "@/store/modules/auth/authSlice";
import type {
  ApiResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenResponse,
} from "@/types";

export const authApi = rootApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<ApiResponse<RegisterResponse>, RegisterRequest>({
      query: (body) => ({ url: "/auth/sign-up", method: "POST", body }),
    }),

    login: build.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (body) => ({ url: "/auth/sign-in", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const payload = data.data;
          // Only set credentials if user is verified (has accessToken)
          if ("accessToken" in payload && "user" in payload) {
            dispatch(setCredentials({ accessToken: payload.accessToken, user: { ...payload.user, isEmailVerified: true } }));
          }
          // If needVerification, don't dispatch anything — let the component handle redirect
        } catch {
          dispatch(clearCredentials());
        }
      },
    }),

    verifyOtp: build.mutation<ApiResponse<OtpVerifyResponse>, OtpVerifyRequest>({
      query: (body) => ({ url: "/auth/otp/verify", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ accessToken: data.data.accessToken, user: { ...data.data.user, isEmailVerified: true } }));
        } catch {}
      },
    }),

    resendOtp: build.mutation<ApiResponse<{ message: string }>, ResendOtpRequest>({
      query: (body) => ({ url: "/auth/otp/resend", method: "POST", body }),
    }),

    forgotPassword: build.mutation<ApiResponse<{ message: string }>, ForgotPasswordRequest>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    resetPassword: build.mutation<ApiResponse<{ message: string }>, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),

    refreshToken: build.mutation<ApiResponse<RefreshTokenResponse>, void>({
      query: () => ({ url: "/auth/refresh", method: "POST", credentials: "include" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ accessToken: data.data.accessToken, user: data.data.user }));
        } catch {
          dispatch(clearCredentials());
        }
      },
    }),

    logout: build.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({ url: "/auth/logout", method: "POST", credentials: "include" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(clearCredentials());
        try { await queryFulfilled; } catch {}
      },
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;