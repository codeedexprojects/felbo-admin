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
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;
    const isRefreshEndpoint = originalRequest.url === '/admin/auth/refresh-token';
    const isLoginEndpoint = originalRequest.url === '/admin/auth/login';

    if (is401 && !alreadyRetried && !isRefreshEndpoint && !isLoginEndpoint) {
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
        const response = await apiClient.post<ApiResponse<LoginResponse>>(
          '/admin/auth/refresh-token'
        );

        if (response.data.success && response.data.data) {
          const { token, admin } = response.data.data;

          useAuthStore.getState().updateToken(token, admin);

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

    const apiMessage = error.response?.data?.error?.message;
    if (apiMessage) {
      return Promise.reject(new Error(apiMessage));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
