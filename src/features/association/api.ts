import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { AssociationVendorListFilter, AssociationVendorListResponse } from './types';

export const getAssociationVendors = async (
  filters: AssociationVendorListFilter = { page: 1, limit: 10 }
): Promise<AssociationVendorListResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.verificationStatus && filters.verificationStatus !== 'ALL')
    params.append('verificationStatus', filters.verificationStatus);

  const response = await apiClient.get<ApiResponse<AssociationVendorListResponse>>(
    `/admin/vendors?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch vendors');
  }

  return response.data.data;
};
