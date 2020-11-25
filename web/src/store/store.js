import { configureStore } from '@reduxjs/toolkit';
import appointmentReducer from './slices/appointmentSlice';
import authReducer from './slices/authSlice';
import doctorReducer from './slices/doctorSlice';
import patientReducer from './slices/patientSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    patients: patientReducer,
    doctors: doctorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

