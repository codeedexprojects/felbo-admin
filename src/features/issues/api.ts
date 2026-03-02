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
    `/admin/issues?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch issues');
  }

  return response.data.data;
};

export const getIssueById = async (id: string): Promise<IssueDetail> => {
  const response = await apiClient.get<ApiResponse<IssueDetail>>(`/admin/issues/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch issue');
  }

  return response.data.data;
};

export const updateIssueStatus = async (
  id: string,
  status: 'RESOLVED' | 'REJECTED',
  reason: string
): Promise<void> => {
  const response = await apiClient.patch<ApiResponse<void>>(`/admin/issues/${id}/status`, {
    status,
    reason,
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to update issue status');
  }
};

export const flagVendorForIssue = async (id: string): Promise<{ alreadyFlagged: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ alreadyFlagged: boolean }>>(
    `/admin/issues/${id}/flag-vendor`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to flag vendor');
  }

  return response.data.data;
};

export const processRefundForIssue = async (id: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(`/admin/issues/${id}/refund`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to process refund');
  }
};
