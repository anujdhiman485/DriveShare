import api from './api';

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Car APIs
export const carAPI = {
  getAllCars: (params) => api.get('/cars', { params }),
  getCarById: (id) => api.get(`/cars/${id}`),
  createCar: (carData) => api.post('/cars', carData),
  updateCar: (id, carData) => api.put(`/cars/${id}`, carData),
  deleteCar: (id) => api.delete(`/cars/${id}`),
  getMyCars: () => api.get('/cars/my-cars'),
  searchCars: (searchParams) => api.get('/cars/search', { params: searchParams }),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getReceivedBookings: () => api.get('/bookings/received'),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
};

// Exchange APIs
export const exchangeAPI = {
  createExchangeRequest: (exchangeData) => api.post('/exchanges', exchangeData),
  getMyExchangeRequests: () => api.get('/exchanges/my-requests'),
  getReceivedExchangeRequests: () => api.get('/exchanges/received'),
  updateExchangeStatus: (id, status) => api.patch(`/exchanges/${id}/status`, { status }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserStats: () => api.get('/users/stats'),
};

// Review APIs
export const reviewAPI = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getCarReviews: (carId) => api.get(`/reviews/car/${carId}`),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};
