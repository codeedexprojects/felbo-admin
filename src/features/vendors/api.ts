import axios from '@/lib/axios';
import {
  VendorListFilter,
  VendorListResponse,
  VendorAdminDetail,
  VendorRequestDetail,
  VerificationRequestsFilter,
  VerificationRequestsResponse,
  VendorBookingListResponse,
} from './types';
import { ListBookingsFilter } from '../bookings/types';
import { ApiResponse } from '@/types/api';

export const getVendorRequestDetail = async (id: string): Promise<VendorRequestDetail> => {
  const response = await axios.get<ApiResponse<VendorRequestDetail>>(
    `/admin/vendors/requests/${id}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch request detail');
  }
  return response.data.data;
};

export const getVerificationRequests = async (
  filters: VerificationRequestsFilter = { page: 1, limit: 10 }
): Promise<VerificationRequestsResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);

  const response = await axios.get<ApiResponse<VerificationRequestsResponse>>(
    `/admin/vendors/requests?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch verification requests');
  }

  return response.data.data;
};

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

export const getVendorDetail = async (id: string): Promise<VendorAdminDetail> => {
  const response = await axios.get<ApiResponse<VendorAdminDetail>>(`/admin/vendors/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch vendor detail');
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

export const getVendorBookings = async (
  id: string,
  filters: ListBookingsFilter = { page: 1, limit: 10 }
): Promise<VendorBookingListResponse> => {
  const params = new URLSearchParams();
  params.append('page', (filters.page || 1).toString());
  params.append('limit', (filters.limit || 10).toString());
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await axios.get<ApiResponse<VendorBookingListResponse>>(
    `/admin/vendors/${id}/bookings?${params.toString()}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch vendor bookings');
  }
  return response.data.data;
};
