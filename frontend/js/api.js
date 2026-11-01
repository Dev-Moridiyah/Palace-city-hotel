/* =========================================================
   Palace City Hotel � API helper
   Small wrapper around fetch() so every page talks to the
   Express/MongoDB backend the same way.
========================================================= */

const API_BASE = '/api';
const nairaFormatter = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });

function formatNaira(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError('Room price must be a valid number');
  }
  return `₦${nairaFormatter.format(amount)}`;
}

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('pch_admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

const api = {
  // Rooms
  getRooms: (query = '') => apiRequest(`/rooms${query}`),
  getRoom: (id) => apiRequest(`/rooms/${id}`),
  createRoom: (body) => apiRequest('/rooms', { method: 'POST', body: JSON.stringify(body) }),
  updateRoom: (id, body) => apiRequest(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteRoom: (id) => apiRequest(`/rooms/${id}`, { method: 'DELETE' }),

  // Services
  getServices: () => apiRequest('/services'),

  // Bookings
  createBooking: (body) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getBookings: (query = '') => apiRequest(`/bookings${query}`),
  updateBooking: (id, body) => apiRequest(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBooking: (id) => apiRequest(`/bookings/${id}`, { method: 'DELETE' }),

  // Contact
  sendMessage: (body) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(body) }),
  getMessages: () => apiRequest('/contact'),
  deleteMessage: (id) => apiRequest(`/contact/${id}`, { method: 'DELETE' }),

  // Auth
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiRequest('/auth/me'),
};
