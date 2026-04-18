import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import type { RootState } from "@/store";
import { setCredentials, clearCredentials } from "@/store/modules/auth/authSlice";
import { AuthUser } from "@/types";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Never try to refresh if the refresh endpoint itself returned 401
    // — session is gone, clearCredentials triggers AuthInitializer redirect
    const isRefreshEndpoint =
      typeof args === "object" &&
      "url" in args &&
      (args as FetchArgs).url === "/auth/refresh";

    if (isRefreshEndpoint) {
      api.dispatch(clearCredentials());
      return result;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await baseQuery(
          { url: "/auth/refresh", method: "POST", credentials: "include" },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // 1. Update the type to include the user object
          const data = refreshResult.data as { 
            data: { accessToken: string; user: AuthUser } 
          };
          
          // 2. Dispatch BOTH the token AND the user into Redux!
          api.dispatch(setCredentials({ 
            accessToken: data.data.accessToken,
            user: data.data.user 
          }));
          
          // Retry original request with fresh token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed — clear state, AuthInitializer handles redirect
          api.dispatch(clearCredentials());
        }
      } finally {
        release();
      }
    } else {
      // Another request already refreshing — wait then retry with new token
      await mutex.waitForUnlock();
      const token = (api.getState() as RootState).auth.accessToken;
      if (token) {
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh that was in flight also failed
        api.dispatch(clearCredentials());
      }
    }
  }

  return result;
};

export const rootApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth","Kyc","Transactions","UserProfile","Notifications","Wallet","Cycles"
  ],
  endpoints: () => ({}),
});