'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCoinStats,
  getTransactions,
  getCoinTrend,
  getLeaderboard,
  creditCoins,
  debitCoins,
  getAdminCoinLogs,
} from './api';
import type { TransactionsFilter, CoinActionInput, CoinTrendGranularity } from './types';

export const useCoinStats = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ['felbocoin', 'stats', from, to],
    queryFn: () => getCoinStats(from, to),
    placeholderData: (prev) => prev,
  });
};

export const useTransactions = (filters: TransactionsFilter) => {
  return useQuery({
    queryKey: ['felbocoin', 'transactions', filters],
    queryFn: () => getTransactions(filters),
    placeholderData: (prev) => prev,
  });
};

export const useCoinTrend = (from: string, to: string, granularity: CoinTrendGranularity) => {
  return useQuery({
    queryKey: ['felbocoin', 'trend', from, to, granularity],
    queryFn: () => getCoinTrend(from, to, granularity),
    enabled: !!from && !!to,
    placeholderData: (prev) => prev,
  });
};

export const useLeaderboard = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['felbocoin', 'leaderboard', page, limit],
    queryFn: () => getLeaderboard(page, limit),
    placeholderData: (prev) => prev,
  });
};

export const useCreditCoins = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CoinActionInput) => creditCoins(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['felbocoin'] });
    },
  });
};

export const useDebitCoins = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CoinActionInput) => debitCoins(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['felbocoin'] });
    },
  });
};

export const useAdminCoinLogs = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['felbocoin', 'admin-logs', page, limit],
    queryFn: () => getAdminCoinLogs(page, limit),
    placeholderData: (prev) => prev,
  });
};
