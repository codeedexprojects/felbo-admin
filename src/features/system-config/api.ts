import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { ConfigDTO, ConfigsByCategoryDTO } from './types';

export const getAllConfigs = async (): Promise<ConfigsByCategoryDTO[]> => {
  const response = await axios.get<ApiResponse<ConfigsByCategoryDTO[]>>('/admin/config');
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch configs');
  }
  return response.data.data;
};

export const getConfigsByCategory = async (category: string): Promise<ConfigsByCategoryDTO> => {
  const response = await axios.get<ApiResponse<ConfigsByCategoryDTO>>(`/admin/config/${category}`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch configs');
  }
  return response.data.data;
};

export const updateConfig = async (key: string, value: string): Promise<ConfigDTO> => {
  const response = await axios.patch<ApiResponse<ConfigDTO>>(`/admin/config/${key}`, { value });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to update config');
  }
  return response.data.data;
};
