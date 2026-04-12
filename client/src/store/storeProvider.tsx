"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { setInitialized } from "@/store/modules/auth/authSlice";
import { useRefreshTokenMutation } from "@/store/modules/auth/authApi";

// -------------------------
// Silent refresh on app load
// Attempts to get new access token using httpOnly refresh cookie
// If cookie is valid — user stays logged in seamlessly
// If cookie is expired/missing — user gets cleared, redirect to login
// -------------------------
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [refreshToken] = useRefreshTokenMutation();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    refreshToken()
      .unwrap()
      .catch(() => {
        // Refresh failed — user not logged in, clearCredentials already called in mutation
      })
      .finally(() => {
        store.dispatch(setInitialized());
      });
  }, [refreshToken]);

  return <>{children}</>;
}

// -------------------------
// Root provider — wraps entire app
// -------------------------
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}