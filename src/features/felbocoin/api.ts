import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import type {
  AdminCoinStats,
  AdminTransactionList,
  CoinTrendBucket,
  LeaderboardList,
  AdminLogList,
  TransactionsFilter,
  CoinActionInput,
  CoinTrendGranularity,
} from './types';

export const getCoinStats = async (from?: string, to?: string): Promise<AdminCoinStats> => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  const response = await apiClient.get<ApiResponse<AdminCoinStats>>(
    `/admin/felbocoin/stats${query ? `?${query}` : ''}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch coin stats');
  }
  return response.data.data;
};

export const getTransactions = async (
  filters: TransactionsFilter
): Promise<AdminTransactionList> => {
  const { page, limit, search, type, direction, from, to } = filters;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (direction) params.append('direction', direction);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const response = await apiClient.get<ApiResponse<AdminTransactionList>>(
    `/admin/felbocoin/transactions?${params.toString()}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch transactions');
  }
  return response.data.data;
};

export const getCoinTrend = async (
  from: string,
  to: string,
  granularity: CoinTrendGranularity
): Promise<CoinTrendBucket[]> => {
  const params = new URLSearchParams({ from, to, granularity });
  const response = await apiClient.get<ApiResponse<CoinTrendBucket[]>>(
    `/admin/felbocoin/trend?${params.toString()}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch coin trend');
  }
  return response.data.data;
};

export const getLeaderboard = async (page: number, limit: number): Promise<LeaderboardList> => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  const response = await apiClient.get<ApiResponse<LeaderboardList>>(
    `/admin/felbocoin/users?${params.toString()}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch leaderboard');
  }
  return response.data.data;
};

export const creditCoins = async (userId: string, input: CoinActionInput): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(
    `/admin/felbocoin/users/${userId}/credit`,
    input
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to credit coins');
  }
};

export const debitCoins = async (userId: string, input: CoinActionInput): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(
    `/admin/felbocoin/users/${userId}/debit`,
    input
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to debit coins');
  }
};

export const getAdminCoinLogs = async (page: number, limit: number): Promise<AdminLogList> => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  const response = await apiClient.get<ApiResponse<AdminLogList>>(
    `/admin/felbocoin/admin-logs?${params.toString()}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch admin logs');
  }
  return response.data.data;
};
