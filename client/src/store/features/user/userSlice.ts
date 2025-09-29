// store/slices/userSlice.ts
import apiRequest from '@/lib/apiRequest';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  currency?: string;
  occupation?: string;
  profilePicture?: string;
  address: {
    country: string;
    countryCode: string;
    state: string;
    city: string;
    street: string;
    postalCode?: string;
  };
  nextOfKin: {
    name: string;
    relationship: string;
    phone: string;
  };
  identity: {
    verified: boolean;
    nin: string;
  };
  role: string;
  status: string;
  tier: number;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  uploadLoading: boolean;
  success: boolean;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  updateLoading: false,
  uploadLoading: false,
  success: false,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest.get('/users/profile');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updateData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const res = await apiRequest.put('/users/profile', updateData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'user/uploadProfilePicture',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiRequest.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to upload image');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.success = false;
    },
    resetUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.updateLoading = false;
      state.uploadLoading = false;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = { ...state.profile, ...action.payload.data };
        state.success = true;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // Upload Profile Picture
    builder
      .addCase(uploadProfilePicture.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.uploadLoading = false;
        if (state.profile) {
          state.profile.profilePicture = action.payload.data.imageUrl;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, clearUserSuccess, resetUserState, clearProfile } = userSlice.actions;
export default userSlice.reducer;