// redux/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the user data you store in Redux state
interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  // Add any other user fields you expect to store in the Redux state after registration/login
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // --- Login Actions ---
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },

    // --- Registration Actions (NEW) ---
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      // Upon successful registration, you might want to immediately log the user in,
      // or simply clear loading state and indicate success without setting isAuthenticated
      // For an investment platform, immediate login after successful registration is common.
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false; // Registration failure means not authenticated
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },

    // --- General Actions ---
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearAuthError: (state) => { // Added for explicit error clearing
      state.error = null;
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart, // Export new actions
  registerSuccess,
  registerFailure,
  logout,
  updateUserProfile,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;