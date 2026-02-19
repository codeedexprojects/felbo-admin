import axios from '@/lib/axios';
import { VendorListFilter, VendorListResponse } from './types';
import { ApiResponse } from '@/types/api';

export const getVendors = async (
  filters: VendorListFilter = { page: 1, limit: 10 }
): Promise<VendorListResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.verificationStatus && filters.verificationStatus !== 'ALL')
    params.append('verificationStatus', filters.verificationStatus);

  const response = await axios.get<ApiResponse<VendorListResponse>>(
    `/admin/vendors?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch vendors');
  }

  return response.data.data;
};

export const verifyVendor = async (id: string): Promise<void> => {
  const response = await axios.post<ApiResponse<void>>(`/admin/vendors/${id}/verify`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to verify vendor');
  }
};

export const rejectVendor = async (id: string, reason: string): Promise<void> => {
  const response = await axios.post<ApiResponse<void>>(`/admin/vendors/${id}/reject`, { reason });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to reject vendor');
  }
};
