'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRevenueOverview,
  getRevenueReports,
  getRefunds,
  getAssociationRevenue,
  getPayoutEarningSummary,
  getPayoutHistory,
  sendPayout,
  verifyPayout,
  getAssociationAdminEarnings,
} from './api';
import {
  RevenueReportsFilter,
  RefundsFilter,
  AssociationRevenueFilter,
  PayoutHistoryFilter,
  SendPayoutInput,
  VerifyPayoutInput,
} from './types';

export const useRevenueOverview = () => {
  return useQuery({
    queryKey: ['finance', 'revenue-overview'],
    queryFn: getRevenueOverview,
  });
};

export const useRevenueReports = (filters: RevenueReportsFilter) => {
  return useQuery({
    queryKey: ['finance', 'revenue-reports', filters],
    queryFn: () => getRevenueReports(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useRefunds = (filters: RefundsFilter) => {
  return useQuery({
    queryKey: ['finance', 'refunds', filters],
    queryFn: () => getRefunds(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useAssociationRevenue = (filters: AssociationRevenueFilter) => {
  return useQuery({
    queryKey: ['finance', 'association-revenue', filters],
    queryFn: () => getAssociationRevenue(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const usePayoutEarningSummary = () => {
  return useQuery({
    queryKey: ['finance', 'payout-earning-summary'],
    queryFn: getPayoutEarningSummary,
  });
};

export const usePayoutHistory = (filters: PayoutHistoryFilter) => {
  return useQuery({
    queryKey: ['finance', 'payout-history', filters],
    queryFn: () => getPayoutHistory(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useAssociationAdminEarnings = () => {
  return useQuery({
    queryKey: ['finance', 'association-admin-earnings'],
    queryFn: getAssociationAdminEarnings,
  });
};

// Super admin sends a payout to an association admin
export const useSendPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendPayoutInput) => sendPayout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payout-history'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'association-admin-earnings'] });
    },
  });
};

// Association admin confirms or disputes a received payout
export const useVerifyPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VerifyPayoutInput }) =>
      verifyPayout(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payout-history'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'payout-earning-summary'] });
    },
  });
};
