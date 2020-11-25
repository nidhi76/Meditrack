import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import medicalHistoryService from '../../services/medicalHistoryService';
import patientService from '../../services/patientService';

// Async thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await patientService.getPatients();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const fetchPatientProfile = createAsyncThunk(
  'patients/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await patientService.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updatePatientProfile = createAsyncThunk(
  'patients/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await patientService.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchMedicalHistory = createAsyncThunk(
  'patients/fetchMedicalHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await medicalHistoryService.getMedicalHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medical history');
    }
  }
);

export const updateMedicalHistory = createAsyncThunk(
  'patients/updateMedicalHistory',
  async (historyData, { rejectWithValue }) => {
    try {
      const response = await medicalHistoryService.updateMedicalHistory(historyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update medical history');
    }
  }
);

const initialState = {
  patients: [],
  profile: null,
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch profile
      .addCase(fetchPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updatePatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch medical history
      .addCase(fetchMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      })
      .addCase(fetchMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update medical history
      .addCase(updateMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      })
      .addCase(updateMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = patientSlice.actions;
export default patientSlice.reducer;

