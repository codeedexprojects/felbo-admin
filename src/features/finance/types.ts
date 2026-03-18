// Finance feature types — aligned to backend DTOs

export interface FinanceSummaryPeriodDto {
  revenue: number;
  bookingCount: number;
}

export interface RefundStatsDto {
  total: number;
  thisMonth: number;
}

export interface FinanceSummaryDto {
  today: FinanceSummaryPeriodDto;
  thisWeek: FinanceSummaryPeriodDto;
  thisMonth: FinanceSummaryPeriodDto;
  total: FinanceSummaryPeriodDto;
  associationCommission: number;
  refundStats: RefundStatsDto;
}

export interface RevenueChartPoint {
  date: string; // 'YYYY-MM-DD'
  revenue: number;
  bookingCount: number;
}

export type RegistrationType = 'ASSOCIATION' | 'INDEPENDENT';

export interface VendorRevenueRow {
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  registrationType: RegistrationType;
  shopCount: number;
  bookingCount: number;
  revenue: number;
}

export interface VendorRevenueTableResponse {
  vendors: VendorRevenueRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type FinancePeriod = 'today' | 'week' | 'month' | 'custom';

export interface VendorRevenueTableFilter {
  period?: FinancePeriod;
  from?: string;
  to?: string;
  search?: string;
  sortOrder?: 'asc' | 'desc';
  minRevenue?: number;
  maxRevenue?: number;
  page?: number;
  limit?: number;
}

// ─── Payout types (backend DTOs) ────────────────────────────────────────────

export type PayoutStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface PayoutItemDto {
  id: string;
  amount: number;
  bookingCount: number;
  status: PayoutStatus;
  requestedBy: string;
  processedBy: string | null;
  rejectionReason: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutListResponse {
  payouts: PayoutItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Super Admin dashboard: how much is owed, totals */
export interface PayoutDashboardDto {
  owedAmount: number;
  totalCommission: number;
  totalPaid: number;
  bookingCount: number;
  lastPayoutDate: string | null;
}

/** Association Admin: pending amount + booking count for them */
export interface PayoutAssocSummaryDto {
  pendingAmount: number;
  bookingCount: number;
}

export interface PayoutListFilter {
  status?: PayoutStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Refund types ────────────────────────────────────────────────────────────

export type RefundType = 'ISSUE' | 'CANCELLATION';

export interface RefundHistoryItemDto {
  type: RefundType;
  amount: number;
  refundStatus: string;
  bookingId: string;
  bookingNumber: string;
  userName: string;
  shopName: string;
  refundedAt: string;
  reason?: string;
  issueType?: string;
}

export interface RefundHistoryResponse {
  refunds: RefundHistoryItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RefundHistoryFilter {
  type?: RefundType;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

// ─── Association Finance types ────────────────────────────────────────────────

export interface AssocFinanceSummaryDto {
  vendorCount: number;
  today: FinanceSummaryPeriodDto;
  thisWeek: FinanceSummaryPeriodDto;
  thisMonth: FinanceSummaryPeriodDto;
  total: FinanceSummaryPeriodDto;
}
