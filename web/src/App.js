import { Box, CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import BookAppointmentPage from './pages/appointments/BookAppointmentPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DiagnosePage from './pages/doctor/DiagnosePage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage';
import MedicalHistoryPage from './pages/medical/MedicalHistoryPage';
import ProfilePage from './pages/profile/ProfilePage';
import { checkAuthStatus } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={user?.userType === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={user?.userType === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Patient Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={user?.userType === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected Patient Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout>
              <AppointmentsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/book"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout>
              <BookAppointmentPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-history"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout>
              <MedicalHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Protected Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout>
              <DoctorDashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout>
              <DoctorAppointmentsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments/:id/diagnose"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout>
              <DiagnosePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout>
              <DoctorPatientsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

