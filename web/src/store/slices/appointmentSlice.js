import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import appointmentService from '../../services/appointmentService';

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointment = createAsyncThunk(
  'appointments/fetchAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'appointments/bookAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentService.bookAppointment(appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointmentData }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.updateAppointment(id, appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelAppointment(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'appointments/fetchAvailableSlots',
  async ({ doctorEmail, date }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAvailableSlots(doctorEmail, date);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available slots');
    }
  }
);

const initialState = {
  appointments: [],
  currentAppointment: null,
  availableSlots: [],
  loading: false,
  error: null,
  bookingLoading: false,
  bookingError: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.bookingError = null;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single appointment
      .addCase(fetchAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Book appointment
      .addCase(bookAppointment.pending, (state) => {
        state.bookingLoading = true;
        state.bookingError = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.appointments.unshift(action.payload);
        state.bookingError = null;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      })
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index].status = 'cancelled';
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch available slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAppointment, clearAvailableSlots } = appointmentSlice.actions;
export default appointmentSlice.reducer;

