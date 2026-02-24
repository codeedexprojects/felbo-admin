import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { ListUsersFilter, ListUsersResponse, UserDetail } from './types';

export const getUsers = async (filters: ListUsersFilter): Promise<ListUsersResponse> => {
  const { page = 1, limit = 10, search, status } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await apiClient.get<ApiResponse<ListUsersResponse>>(
    `/admin/users?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch users');
  }

  return response.data.data;
};

export const getUserById = async (id: string): Promise<UserDetail> => {
  const response = await apiClient.get<ApiResponse<UserDetail>>(`/admin/users/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch user details');
  }

  return response.data.data;
};

export const blockUser = async (id: string, reason: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(`/admin/users/${id}/block`, { reason });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to block user');
  }
};

export const unblockUser = async (id: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(`/admin/users/${id}/unblock`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to unblock user');
  }
};
