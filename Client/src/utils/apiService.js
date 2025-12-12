import api from './api';

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/current-user'),
  updateProfile: (userData) => api.patch('/auth/update-profile', userData),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Car APIs
export const carAPI = {
  getAllCars: (params) => api.get('/cars', { params }),
  getCarById: (id) => api.get(`/cars/${id}`),
  createCar: (carData) => api.post('/cars/create', carData),
  updateCar: (id, carData) => api.patch(`/cars/${id}/update`, carData),
  deleteCar: (id) => api.delete(`/cars/${id}/delete`),
  getMyCars: () => api.get('/cars/my-cars'),
  toggleAvailability: (id) => api.patch(`/cars/${id}/toggle-availability`),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings/create', bookingData),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getReceivedBookings: (params) => api.get('/bookings/received', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
};

// Exchange APIs
export const exchangeAPI = {
  createExchangeRequest: (exchangeData) => api.post('/exchanges/create', exchangeData),
  getMyExchangeRequests: (params) => api.get('/exchanges/my-requests', { params }),
  getReceivedExchangeRequests: (params) => api.get('/exchanges/received', { params }),
  getExchangeById: (id) => api.get(`/exchanges/${id}`),
  updateExchangeStatus: (id, status, ownerResponse) => 
    api.patch(`/exchanges/${id}/status`, { status, ownerResponse }),
  cancelExchange: (id, reason) => api.patch(`/exchanges/${id}/cancel`, { reason }),
};

// Review APIs
export const reviewAPI = {
  createReview: (reviewData) => api.post('/reviews/create', reviewData),
  getCarReviews: (carId) => api.get(`/reviews/car/${carId}`),
  getUserReviews: () => api.get('/reviews/my-reviews'),
  deleteReview: (id) => api.delete(`/reviews/${id}/delete`),
};
