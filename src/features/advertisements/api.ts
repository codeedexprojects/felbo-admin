import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { Ad, ListAdsFilter, ListAdsResponse, CreateAdInput, UpdateAdInput } from './types';

export const getAds = async (filters: ListAdsFilter): Promise<ListAdsResponse> => {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    limit: filters.limit.toString(),
  });

  const response = await apiClient.get<ApiResponse<ListAdsResponse>>(
    `/admin/advertisements?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch advertisements');
  }

  return response.data.data;
};

export const getAdById = async (id: string): Promise<Ad> => {
  const response = await apiClient.get<ApiResponse<Ad>>(`/admin/advertisements/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch advertisement');
  }

  return response.data.data;
};

export const createAd = async (input: CreateAdInput): Promise<Ad> => {
  const response = await apiClient.post<ApiResponse<Ad>>('/admin/advertisements', input);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to create advertisement');
  }

  return response.data.data;
};

export const updateAd = async (id: string, input: UpdateAdInput): Promise<Ad> => {
  const response = await apiClient.put<ApiResponse<Ad>>(`/admin/advertisements/${id}`, input);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to update advertisement');
  }

  return response.data.data;
};

export const deleteAd = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/advertisements/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to delete advertisement');
  }
};
