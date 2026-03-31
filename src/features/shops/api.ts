import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { PendingShopsFilter, PendingShopsResponse, PendingShopDetailsDto } from './types';

export const getPendingShops = async (
  filters: PendingShopsFilter = { page: 1, limit: 10 }
): Promise<PendingShopsResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await axios.get<ApiResponse<PendingShopsResponse>>(
    `/admin/shops/pending?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch pending shops');
  }

  return response.data.data;
};

export const getPendingShopDetails = async (shopId: string): Promise<PendingShopDetailsDto> => {
  const response = await axios.get<ApiResponse<PendingShopDetailsDto>>(`/admin/shops/${shopId}`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch shop details');
  }
  return response.data.data;
};

export const approveShop = async (shopId: string): Promise<void> => {
  const response = await axios.post<ApiResponse<void>>(`/admin/shops/${shopId}/approve`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to approve shop');
  }
};

export const rejectShop = async (shopId: string, reason: string): Promise<void> => {
  const response = await axios.post<ApiResponse<void>>(`/admin/shops/${shopId}/reject`, {
    reason,
  });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to reject shop');
  }
};
