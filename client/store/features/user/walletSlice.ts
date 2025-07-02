import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import {
  WalletState,
  InitializeFundingPayload,
  VerifyFundingPayload,
  GetTransactionsPayload
} from '@/types/wallet';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api';

// Configure axios with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Async thunks
export const initializeFunding = createAsyncThunk(
  'wallet/initializeFunding',
  async ({ amount }: InitializeFundingPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/fund/initialize`,
        { amount },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      return rejectWithValue(axiosError.response?.data || { message: 'Network error' });
    }
  }
);

export const verifyFunding = createAsyncThunk(
  'wallet/verifyFunding',
  async ({ reference }: VerifyFundingPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/fund/verify/${reference}`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      return rejectWithValue(axiosError.response?.data || { message: 'Network error' });
    }
  }
);

export const getWalletBalance = createAsyncThunk(
  'wallet/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/wallet/balance`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      return rejectWithValue(axiosError.response?.data || { message: 'Network error' });
    }
  }
);

export const getTransactions = createAsyncThunk(
  'wallet/getTransactions',
  async ({ page = 1, limit = 20, type }: GetTransactionsPayload = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString() 
      });
      if (type) params.append('type', type);
      
      const response = await axios.get(
        `${API_BASE_URL}/wallet/transactions?${params}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      return rejectWithValue(axiosError.response?.data || { message: 'Network error' });
    }
  }
);

const initialState: WalletState = {
  balance: 0,
  tier: 1,
  walletId: null,
  transactions: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  funding: {
    loading: false,
    checkoutUrl: null,
    reference: null,
    amount: 0,
    status: null
  },
  loading: {
    balance: false,
    transactions: false,
    verify: false
  },
  error: null
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearFunding: (state) => {
      state.funding = {
        loading: false,
        checkoutUrl: null,
        reference: null,
        amount: 0,
        status: null
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setFundingStatus: (state, action: PayloadAction<string>) => {
      state.funding.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize Funding
      .addCase(initializeFunding.pending, (state) => {
        state.funding.loading = true;
        state.error = null;
      })
      .addCase(initializeFunding.fulfilled, (state, action) => {
        state.funding.loading = false;
        state.funding.checkoutUrl = action.payload.data.checkoutUrl;
        state.funding.reference = action.payload.data.reference;
        state.funding.amount = action.payload.data.amount;
        state.funding.status = 'initialized';
      })
      .addCase(initializeFunding.rejected, (state, action: any) => {
        state.funding.loading = false;
        state.error = action.payload?.message || 'Failed to initialize funding';
      })

      // Verify Funding
      .addCase(verifyFunding.pending, (state) => {
        state.loading.verify = true;
        state.error = null;
      })
      .addCase(verifyFunding.fulfilled, (state, action) => {
        state.loading.verify = false;
        state.funding.status = action.payload.data.status;
        if (action.payload.data.status === 'SUCCESS') {
          // Refresh balance after successful funding
          state.balance += parseFloat(action.payload.data.amount);
        }
      })
      .addCase(verifyFunding.rejected, (state, action: any) => {
        state.loading.verify = false;
        state.error = action.payload?.message || 'Failed to verify funding';
      })

      // Get Balance
      .addCase(getWalletBalance.pending, (state) => {
        state.loading.balance = true;
        state.error = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.loading.balance = false;
        state.balance = action.payload.data.balance;
        state.tier = action.payload.data.tier;
        state.walletId = action.payload.data.walletId;
      })
      .addCase(getWalletBalance.rejected, (state, action: any) => {
        state.loading.balance = false;
        state.error = action.payload?.message || 'Failed to get balance';
      })

      // Get Transactions
      .addCase(getTransactions.pending, (state) => {
        state.loading.transactions = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.transactions = action.payload.data.transactions;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getTransactions.rejected, (state, action: any) => {
        state.loading.transactions = false;
        state.error = action.payload?.message || 'Failed to get transactions';
      });
    },
});

export const { clearFunding, clearError, setFundingStatus } = walletSlice.actions;
export default walletSlice.reducer;