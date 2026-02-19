import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { ApiResponse } from '@/types/api';
import { LoginResponse } from '@/features/auth/types';

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required: sends the httpOnly refresh token cookie automatically
});

// ─── Request interceptor: attach access token ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Refresh-token queue (prevents multiple simultaneous refresh calls) ──────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

// ─── Response interceptor: auto-refresh on 401 ──────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;
    const isRefreshEndpoint = originalRequest.url === '/admin/refresh-token';

    // Only attempt refresh for 401s that haven't been retried and aren't the refresh endpoint itself
    if (is401 && !alreadyRetried && !isRefreshEndpoint) {
      // Another refresh is already in flight — queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/admin/refresh-token');

        if (response.data.success && response.data.data) {
          const { token, admin } = response.data.data;

          // Persist new access token in the store
          useAuthStore.getState().updateToken(token, admin);

          // Resume all queued requests with the new token
          processQueue(null, token);

          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };

          return apiClient(originalRequest);
        }

        throw new Error('Token refresh failed');
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
