import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// -------------------------
// Types
// -------------------------
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MEMBER" | "COMMITEE" | "ADMIN";
  isEmailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  // Tracks if initial silent refresh has been attempted on app load
  // Prevents showing login page while refresh is in flight
  isInitialized: boolean;
}

// -------------------------
// Initial state
// -------------------------
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

// -------------------------
// Slice
// -------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after login or OTP verify — sets user + token
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user?: AuthUser }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
    },

    // Called after silent refresh — only updates token, keeps user
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },

    // Called after logout or refresh failure
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },

    // Called once on app load after initial refresh attempt (success or fail)
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, setAccessToken, clearCredentials, setInitialized } =
  authSlice.actions;

export default authSlice.reducer;

// -------------------------
// Selectors
// -------------------------
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === "ADMIN";