import axios from 'axios';
import { setupMockInterceptor } from '@/api/mock/mockInterceptor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor (added first so it runs before mock)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

if (USE_MOCK) {
  console.log('[API] Mock mode enabled — no VITE_API_BASE_URL set');
  setupMockInterceptor(client);
} else {
  // Real API error handler
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error.message);
    },
  );
}

export default client;
