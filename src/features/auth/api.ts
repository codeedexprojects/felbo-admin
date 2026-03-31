import apiClient from '@/lib/axios';
import { LoginInput, LoginResponse } from '@/features/auth/types'; // Corrected import
import { ApiResponse } from '@/types/api';

export const loginAdmin = async (data: LoginInput): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/admin/auth/login', data);
  return response.data;
};

export const refreshAccessToken = async (): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/admin/auth/refresh-token');
  return response.data;
};

export const logoutAdmin = async (): Promise<void> => {
  await apiClient.post('/admin/auth/logout');
};
