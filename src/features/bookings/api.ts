import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { ListBookingsFilter, ListBookingsResponse } from './types';

export const getBookings = async (filters: ListBookingsFilter): Promise<ListBookingsResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.vendorId && filters.vendorId !== 'ALL') params.append('vendorId', filters.vendorId);

  const response = await axios.get<ApiResponse<ListBookingsResponse>>(
    `/admin/bookings?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch bookings');
  }

  return response.data.data;
};
