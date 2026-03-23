import axios from 'axios';
import { setupMockInterceptor } from '@/api/mock/mockInterceptor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

const APP_VERSION = '0.1.0';
// OS_PLATFORM: NONE=0, PC=-1, EDITOR=-2, IOS=1, AOS=2
const PLATFORM = -2;

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Version': APP_VERSION,
    'BundleVersion': APP_VERSION,
    'Platform': String(PLATFORM),
  },
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
  // Real API: server wraps responses as { system, content, error? }
  client.interceptors.response.use(
    (response) => {
      const body = response.data;
      // Business-level error returned with HTTP 200
      if (body?.error) {
        return Promise.reject(body.error);
      }
      // Return the actual payload from content
      return body?.content ?? body;
    },
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data?.error ?? error.response?.data ?? error.message);
    },
  );
}

export default client;
