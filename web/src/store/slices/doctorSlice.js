import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import doctorService from '../../services/doctorService';

// Async thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await doctorService.getDoctors();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorProfile = createAsyncThunk(
  'doctors/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await doctorService.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctors/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await doctorService.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const addDiagnosis = createAsyncThunk(
  'doctors/addDiagnosis',
  async ({ appointmentId, diagnosisData }, { rejectWithValue }) => {
    try {
      const response = await doctorService.addDiagnosis(appointmentId, diagnosisData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add diagnosis');
    }
  }
);

const initialState = {
  doctors: [],
  profile: null,
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch profile
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add diagnosis
      .addCase(addDiagnosis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDiagnosis.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addDiagnosis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = doctorSlice.actions;
export default doctorSlice.reducer;

