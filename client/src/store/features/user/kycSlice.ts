// store/slices/kycSlice.ts
import apiRequest from '@/lib/apiRequest';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
interface KYCData {
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  identity: {
    nin?: string;
    idCardUrl?: string;
    selfieUrl?: string;
    verified: boolean;
    hasDocuments: boolean;
  };
}

interface KYCState {
  data: KYCData | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  uploadLoading: boolean;
}

const initialState: KYCState = {
  data: null,
  loading: false,
  error: null,
  success: false,
  uploadLoading: false,
};

// Async thunks
export const uploadKYC = createAsyncThunk(
  'kyc/upload',
  async (kycData: { nin: string; idCard: File; selfie: File }, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux thunk received:', {
        nin: kycData.nin,
        idCard: kycData.idCard?.name,
        selfie: kycData.selfie?.name
      });

      const formData = new FormData();
      formData.append('nin', kycData.nin);
      formData.append('idCard', kycData.idCard);
      formData.append('selfie', kycData.selfie);

      // Debug FormData
      for (const [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      const res = await apiRequest.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return res.data;
    } catch (err: any) {
      console.error('❌ Upload error:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || 'KYC Upload Failed');
    }
  }
);

export const fetchKYCStatus = createAsyncThunk(
  'kyc/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest.get('/kyc/status');
      console.log('✅ KYC Status fetched:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('❌ Fetch KYC Status error:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearKYCError: (state) => {
      state.error = null;
    },
    clearKYCSuccess: (state) => {
      state.success = false;
    },
    resetKYCState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.uploadLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Upload KYC
    builder
      .addCase(uploadKYC.pending, (state) => {
        state.uploadLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(uploadKYC.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.success = true;
        state.error = null;
        
        // Update local data with the uploaded info
        if (action.payload.data?.identity) {
          state.data = {
            kycStatus: 'PENDING',
            identity: {
              verified: false,
              hasDocuments: true,
              nin: action.payload.data.identity.nin,
              idCardUrl: action.payload.data.identity.idCardUrl,
              selfieUrl: action.payload.data.identity.selfieUrl
            }
          };
        }
      })
      .addCase(uploadKYC.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Fetch KYC Status
    builder
      .addCase(fetchKYCStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKYCStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
        console.log('🏪 Redux state updated with:', action.payload.data);
      })
      .addCase(fetchKYCStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearKYCError, clearKYCSuccess, resetKYCState } = kycSlice.actions;
export default kycSlice.reducer;