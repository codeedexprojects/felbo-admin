import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  FinanceSummaryDto,
  RevenueChartPoint,
  VendorRevenueTableFilter,
  VendorRevenueTableResponse,
  FinancePeriod,
  PayoutDashboardDto,
  PayoutItemDto,
  PayoutListResponse,
  PayoutAssocSummaryDto,
  PayoutListFilter,
  RefundHistoryFilter,
  RefundHistoryResponse,
  AssocFinanceSummaryDto,
} from './types';

// ─── Finance API ─────────────────────────────────────────────────────────────

export const fetchFinanceSummary = async (): Promise<FinanceSummaryDto> => {
  const res = await apiClient.get<ApiResponse<FinanceSummaryDto>>('/admin/finance/stats');
  return res.data.data!;
};

export const fetchRevenueChart = async (
  period: FinancePeriod = 'month',
  from?: string,
  to?: string
): Promise<RevenueChartPoint[]> => {
  const params: Record<string, string> = { period };
  if (period === 'custom' && from && to) {
    params.from = from;
    params.to = to;
  }
  const res = await apiClient.get<ApiResponse<RevenueChartPoint[]>>('/admin/finance/chart', {
    params,
  });
  return res.data.data!;
};

export const fetchVendorRevenueTable = async (
  filter: VendorRevenueTableFilter
): Promise<VendorRevenueTableResponse> => {
  const params: Record<string, string | number> = {
    period: filter.period ?? 'month',
    page: filter.page ?? 1,
    limit: filter.limit ?? 10,
    sortOrder: filter.sortOrder ?? 'desc',
  };
  if (filter.period === 'custom' && filter.from && filter.to) {
    params.from = filter.from;
    params.to = filter.to;
  }
  if (filter.search) params.search = filter.search;
  if (filter.minRevenue !== undefined) params.minRevenue = filter.minRevenue;
  if (filter.maxRevenue !== undefined) params.maxRevenue = filter.maxRevenue;

  const res = await apiClient.get<ApiResponse<VendorRevenueTableResponse>>(
    '/admin/finance/vendors',
    { params }
  );
  return res.data.data!;
};

// ─── Payout API ───────────────────────────────────────────────────────────────

/** Super Admin: dashboard totals */
export const fetchPayoutDashboard = async (): Promise<PayoutDashboardDto> => {
  const res = await apiClient.get<ApiResponse<PayoutDashboardDto>>('/admin/payout/dashboard');
  return res.data.data!;
};

/** Super Admin: trigger a new payout to the association admin */
export const createPayout = async (): Promise<PayoutItemDto> => {
  const res = await apiClient.post<ApiResponse<PayoutItemDto>>('/admin/payout');
  return res.data.data!;
};

/** Super Admin + Association Admin: list payouts */
export const fetchPayouts = async (filter: PayoutListFilter): Promise<PayoutListResponse> => {
  const params: Record<string, string | number> = {
    page: filter.page ?? 1,
    limit: filter.limit ?? 10,
  };
  if (filter.status) params.status = filter.status;
  const res = await apiClient.get<ApiResponse<PayoutListResponse>>('/admin/payout', { params });
  return res.data.data!;
};

/** Association Admin: get their own pending amount & booking count */
export const fetchAssocPayoutSummary = async (): Promise<PayoutAssocSummaryDto> => {
  const res = await apiClient.get<ApiResponse<PayoutAssocSummaryDto>>('/admin/payout/summary');
  return res.data.data!;
};

/** Association Admin: accept a received payout */
export const acceptPayout = async (id: string): Promise<PayoutItemDto> => {
  const res = await apiClient.put<ApiResponse<PayoutItemDto>>(`/admin/payout/${id}/accept`);
  return res.data.data!;
};

/** Association Admin: reject a payout with a reason */
export const rejectPayout = async (id: string, rejectionReason: string): Promise<PayoutItemDto> => {
  const res = await apiClient.put<ApiResponse<PayoutItemDto>>(`/admin/payout/${id}/reject`, {
    rejectionReason,
  });
  return res.data.data!;
};

// ─── Association Finance API ──────────────────────────────────────────────────

export const fetchAssocFinanceSummary = async (): Promise<AssocFinanceSummaryDto> => {
  const res = await apiClient.get<ApiResponse<AssocFinanceSummaryDto>>(
    '/admin/finance/assoc/stats'
  );
  return res.data.data!;
};

export const fetchAssocVendorRevenueTable = async (
  filter: VendorRevenueTableFilter
): Promise<VendorRevenueTableResponse> => {
  const params: Record<string, string | number> = {
    period: filter.period ?? 'month',
    page: filter.page ?? 1,
    limit: filter.limit ?? 10,
    sortOrder: filter.sortOrder ?? 'desc',
  };
  if (filter.period === 'custom' && filter.from && filter.to) {
    params.from = filter.from;
    params.to = filter.to;
  }
  if (filter.search) params.search = filter.search;
  if (filter.minRevenue !== undefined) params.minRevenue = filter.minRevenue;
  if (filter.maxRevenue !== undefined) params.maxRevenue = filter.maxRevenue;

  const res = await apiClient.get<ApiResponse<VendorRevenueTableResponse>>(
    '/admin/finance/assoc/vendors',
    { params }
  );
  return res.data.data!;
};

// ─── Refund API ───────────────────────────────────────────────────────────────

export const fetchRefundHistory = async (
  filter: RefundHistoryFilter
): Promise<RefundHistoryResponse> => {
  const params: Record<string, string | number> = {
    page: filter.page ?? 1,
    limit: filter.limit ?? 10,
  };
  if (filter.type) params.type = filter.type;
  if (filter.from) params.from = filter.from;
  if (filter.to) params.to = filter.to;

  const res = await apiClient.get<ApiResponse<RefundHistoryResponse>>('/admin/finance/refunds', {
    params,
  });
  return res.data.data!;
};
