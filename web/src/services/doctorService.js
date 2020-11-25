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

const doctorService = {
  // Get all doctors
  getDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },

  // Get doctor profile
  getProfile: async () => {
    const response = await api.get('/doctors/profile');
    return response.data;
  },

  // Update doctor profile
  updateProfile: async (profileData) => {
    const response = await api.put('/doctors/profile', profileData);
    return response.data;
  },

  // Add diagnosis to appointment
  addDiagnosis: async (appointmentId, diagnosisData) => {
    const response = await api.post(`/doctors/diagnose/${appointmentId}`, diagnosisData);
    return response.data;
  },
};

export default doctorService;

