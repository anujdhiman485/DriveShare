import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors and responses
api.interceptors.response.use(
  (response) => {
    // Extract data from the standardized ApiResponse format
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Network error (no response)
    if (!error.response) {
      console.error('Network Error - Backend may not be running');
      return Promise.reject(new Error('Network error. Please check if the backend server is running at http://localhost:8000'));
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Extract error message from ApiError format
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('Error Message:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
