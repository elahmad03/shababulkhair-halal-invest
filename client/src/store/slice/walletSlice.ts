// store/slices/wallet.slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/apiRequest';

type WalletState = {
  balance: number | null;
  tier: string | null;
  cryptoWallet: { address: string; network: string } | null;
  fullWallet: any;
  fundingStatus: 'idle' | 'loading' | 'success' | 'error';
  verifyStatus: 'idle' | 'verifying' | 'success' | 'error';
  error: string | null;
};

const initialState: WalletState = {
  balance: null,
  tier: null,
  cryptoWallet: null,
  fullWallet: null,
  fundingStatus: 'idle',
  verifyStatus: 'idle',
  error: null,
};

// ✅ GET: Balance
export const fetchWalletBalance = createAsyncThunk('wallet/fetchBalance', async (_, thunkAPI) => {
  try {
    const res = await api.get('/wallet/balance');
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch wallet balance');
  }
});

// ✅ GET: Crypto Wallet
export const fetchCryptoWallet = createAsyncThunk('wallet/fetchCrypto', async (_, thunkAPI) => {
  try {
    const res = await api.get('/wallet/crypto');
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch crypto wallet');
  }
});

// ✅ GET: Full Wallet
export const fetchFullWalletInfo = createAsyncThunk('wallet/fetchFull', async (_, thunkAPI) => {
  try {
    const res = await api.get('/wallet/full');
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch full wallet info');
  }
});

// ✅ POST: Initialize Monnify
export const initializeMonnifyFunding = createAsyncThunk(
  'wallet/initializeMonnifyFunding',
  async (amount: number, thunkAPI) => {
    try {
      const res = await api.post('/wallet/fund/initialize/monnify', { amount });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Monnify init failed');
    }
  }
);

// ✅ GET: Verify Monnify
export const verifyMonnifyFunding = createAsyncThunk(
  'wallet/verifyMonnifyFunding',
  async (reference: string, thunkAPI) => {
    try {
      const res = await api.get(`/wallet/fund/verify/monnify/${reference}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Monnify verification failed');
    }
  }
);

// ✅ POST: Initialize Paystack
export const initializePaystackFunding = createAsyncThunk(
  'wallet/initializePaystackFunding',
  async (amount: number, thunkAPI) => {
    try {
      const res = await api.post('/wallet/fund/initialize/paystack', { amount });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Paystack init failed');
    }
  }
);

// ✅ GET: Verify Paystack
export const verifyPaystackFunding = createAsyncThunk(
  'wallet/verifyPaystackFunding',
  async (reference: string, thunkAPI) => {
    try {
      const res = await api.get(`/wallet/fund/verify/paystack/${reference}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Paystack verification failed');
    }
  }
);

// ✅ SLICE
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
        state.tier = action.payload.tier;
      })
      .addCase(fetchCryptoWallet.fulfilled, (state, action) => {
        state.cryptoWallet = action.payload;
      })
      .addCase(fetchFullWalletInfo.fulfilled, (state, action) => {
        state.fullWallet = action.payload;
      })
      .addCase(initializeMonnifyFunding.pending, (state) => {
        state.fundingStatus = 'loading';
      })
      .addCase(initializeMonnifyFunding.fulfilled, (state) => {
        state.fundingStatus = 'success';
      })
      .addCase(initializeMonnifyFunding.rejected, (state, action) => {
        state.fundingStatus = 'error';
        state.error = action.payload as string;
      })
      .addCase(initializePaystackFunding.pending, (state) => {
        state.fundingStatus = 'loading';
      })
      .addCase(initializePaystackFunding.fulfilled, (state) => {
        state.fundingStatus = 'success';
      })
      .addCase(initializePaystackFunding.rejected, (state, action) => {
        state.fundingStatus = 'error';
        state.error = action.payload as string;
      })
      .addCase(verifyMonnifyFunding.pending, (state) => {
        state.verifyStatus = 'verifying';
      })
      .addCase(verifyMonnifyFunding.fulfilled, (state) => {
        state.verifyStatus = 'success';
      })
      .addCase(verifyMonnifyFunding.rejected, (state, action) => {
        state.verifyStatus = 'error';
        state.error = action.payload as string;
      })
      .addCase(verifyPaystackFunding.pending, (state) => {
        state.verifyStatus = 'verifying';
      })
      .addCase(verifyPaystackFunding.fulfilled, (state) => {
        state.verifyStatus = 'success';
      })
      .addCase(verifyPaystackFunding.rejected, (state, action) => {
        state.verifyStatus = 'error';
        state.error = action.payload as string;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
