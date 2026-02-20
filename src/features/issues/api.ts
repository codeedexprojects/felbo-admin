import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { IssueDetail, IssueListFilter, IssueListResponse } from './types';

export const getIssues = async (
  filters: IssueListFilter = { page: 1, limit: 10 }
): Promise<IssueListResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);

  const response = await apiClient.get<ApiResponse<IssueListResponse>>(
    `/issues?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch issues');
  }

  return response.data.data;
};

export const getIssueById = async (id: string): Promise<IssueDetail> => {
  const response = await apiClient.get<ApiResponse<IssueDetail>>(`/issues/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch issue');
  }

  return response.data.data;
};
