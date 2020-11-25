import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.200.160:3001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const appointmentService = {
  // Get all appointments for current user
  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Get single appointment
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Book new appointment (with Patient Notes feature)
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  // Get available time slots for doctor
  getAvailableSlots: async (doctorEmail, date) => {
    const response = await api.get(`/appointments/available/${doctorEmail}/${date}`);
    return response.data;
  },

  // Check appointment conflicts
  checkConflicts: async (appointmentData) => {
    const response = await api.post('/appointments/check-conflicts', appointmentData);
    return response.data;
  },
};

export default appointmentService;

