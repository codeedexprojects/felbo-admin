'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchFinanceSummary,
  fetchRevenueChart,
  fetchVendorRevenueTable,
  fetchAssocFinanceSummary,
  fetchAssocVendorRevenueTable,
  fetchPayoutDashboard,
  createPayout,
  fetchPayouts,
  fetchAssocPayoutSummary,
  acceptPayout,
  rejectPayout,
  fetchRefundHistory,
  fetchRegistrations,
} from './api';
import {
  FinancePeriod,
  VendorRevenueTableFilter,
  PayoutListFilter,
  RefundHistoryFilter,
  IndependentRegistrationListParams,
} from './types';

// ─── Finance hooks ────────────────────────────────────────────────────────────

export const useFinanceSummary = () => {
  return useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: fetchFinanceSummary,
    staleTime: 60 * 1000,
  });
};

export const useRevenueChartData = (
  period: FinancePeriod = 'month',
  from?: string,
  to?: string
) => {
  return useQuery({
    queryKey: ['finance', 'chart-data', period, from, to],
    queryFn: () => fetchRevenueChart(period, from, to),
    staleTime: 2 * 60 * 1000,
    enabled: period !== 'custom' || (!!from && !!to),
  });
};

export const useVendorRevenueTable = (filter: VendorRevenueTableFilter) => {
  return useQuery({
    queryKey: ['finance', 'vendor-revenue', filter],
    queryFn: () => fetchVendorRevenueTable(filter),
    placeholderData: (previous) => previous,
    enabled: filter.period !== 'custom' || (!!filter.from && !!filter.to),
  });
};

export const useAssocFinanceSummary = () => {
  return useQuery({
    queryKey: ['finance', 'assoc-summary'],
    queryFn: fetchAssocFinanceSummary,
    staleTime: 60 * 1000,
  });
};

export const useAssocVendorRevenueTable = (filter: VendorRevenueTableFilter) => {
  return useQuery({
    queryKey: ['finance', 'assoc-vendor-revenue', filter],
    queryFn: () => fetchAssocVendorRevenueTable(filter),
    placeholderData: (previous) => previous,
    enabled: filter.period !== 'custom' || (!!filter.from && !!filter.to),
  });
};

// ─── Payout hooks ──────────────────────────────────────────────────────────────

/** Super Admin: totals dashboard card */
export const usePayoutDashboard = () => {
  return useQuery({
    queryKey: ['payouts', 'dashboard'],
    queryFn: fetchPayoutDashboard,
    staleTime: 60 * 1000,
  });
};

/** Super Admin + Association Admin: paginated payout list with optional status filter */
export const usePayouts = (filter: PayoutListFilter) => {
  return useQuery({
    queryKey: ['payouts', 'list', filter],
    queryFn: () => fetchPayouts(filter),
    placeholderData: (previous) => previous,
  });
};

/** Association Admin: their pending summary */
export const useAssocPayoutSummary = () => {
  return useQuery({
    queryKey: ['payouts', 'assoc-summary'],
    queryFn: fetchAssocPayoutSummary,
    staleTime: 60 * 1000,
  });
};

/** Super Admin: trigger payout */
export const useCreatePayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPayout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
};

/** Association Admin: accept a payout */
export const useAcceptPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptPayout(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
};

/** Association Admin: reject a payout with reason */
export const useRejectPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      rejectPayout(id, rejectionReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
};

// ─── Refund hooks ──────────────────────────────────────────────────────────────

export const useRefundHistory = (filter: RefundHistoryFilter) => {
  return useQuery({
    queryKey: ['finance', 'refunds', filter],
    queryFn: () => fetchRefundHistory(filter),
    placeholderData: (previous) => previous,
  });
};

// ─── Registration hooks ────────────────────────────────────────────────────────

export const useRegistrations = (filter: IndependentRegistrationListParams) => {
  return useQuery({
    queryKey: ['finance', 'registrations', filter],
    queryFn: () => fetchRegistrations(filter),
    placeholderData: (previous) => previous,
  });
};
