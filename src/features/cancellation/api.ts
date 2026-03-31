import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { ListCancellationsFilter, ListCancellationsResponse, CancellationDetail } from './types';

export const getCancellations = async (
  filters: ListCancellationsFilter
): Promise<ListCancellationsResponse> => {
  const params: Record<string, string | number> = {
    page: filters.page || 1,
    limit: filters.limit || 10,
  };

  if (filters.search) params.search = filters.search;
  if (filters.cancelledBy) params.cancelledBy = filters.cancelledBy;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await apiClient.get<ApiResponse<ListCancellationsResponse>>(
    '/admin/bookings/cancellations',
    { params }
  );
  return response.data.data!;
};

export const getCancellationDetail = async (id: string): Promise<CancellationDetail> => {
  const response = await apiClient.get<ApiResponse<CancellationDetail>>(
    `/admin/bookings/cancellations/${id}`
  );
  return response.data.data!;
};
