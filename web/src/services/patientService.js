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

const patientService = {
  // Get all patients (for doctors)
  getPatients: async () => {
    const response = await api.get('/patients');
    return response.data;
  },

  // Get patient profile
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },

  // Update patient profile
  updateProfile: async (profileData) => {
    const response = await api.put('/patients/profile', profileData);
    return response.data;
  },
};

export default patientService;

