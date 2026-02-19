import apiClient from '@/lib/axios';
import { LoginInput, LoginResponse } from '@/features/auth/types'; // Corrected import
import { ApiResponse } from '@/types/api';

export const loginAdmin = async (data: LoginInput): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/admin/login', data);
  return response.data;
};
