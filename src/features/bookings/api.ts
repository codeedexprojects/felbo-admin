import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  ListBookingsFilter,
  ListBookingsResponse,
  BookingDetail,
  AdminBookingStatsFilter,
  AdminBookingStatsResult,
} from './types';

export const getBookingStats = async (
  filters: AdminBookingStatsFilter
): Promise<AdminBookingStatsResult> => {
  const params: Record<string, string> = {};
  if (filters.period) params.period = filters.period;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await apiClient.get<ApiResponse<AdminBookingStatsResult>>(
    '/admin/bookings/stats',
    { params }
  );
  return response.data.data!;
};

export const getBookings = async (filters: ListBookingsFilter): Promise<ListBookingsResponse> => {
  const params: Record<string, string | number> = {
    page: filters.page || 1,
    limit: filters.limit || 10,
  };

  if (filters.status && filters.status !== 'ALL') {
    params.status = filters.status;
  }
  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  const response = await apiClient.get<ApiResponse<ListBookingsResponse>>('/admin/bookings', {
    params,
  });
  return response.data.data!;
};

export const getBookingDetail = async (id: string): Promise<BookingDetail> => {
  const response = await apiClient.get<ApiResponse<BookingDetail>>(`/admin/bookings/${id}`);
  return response.data.data!;
};

export const processRefund = async (id: string, reason: string): Promise<void> => {
  await apiClient.post(`/admin/bookings/${id}/refund`, { reason });
};
