// Revenue Overview
export interface RevenueOverview {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

// Revenue Reports
export interface RevenueReportItem {
  date: string;
  bookings: number;
  amount: number;
  vendorId?: string;
  vendorName?: string;
}

export interface RevenueReportsResponse {
  reports: RevenueReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalAmount: number;
}

export interface RevenueReportsFilter {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}

// Refunds
export type RefundType = 'WALLET' | 'ORIGINAL';
export type RefundStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface RefundItem {
  id: string;
  bookingId: string;
  bookingNumber: string;
  user: { id: string; name: string; phone: string };
  amount: number;
  type: RefundType;
  status: RefundStatus;
  reason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface RefundsResponse {
  refunds: RefundItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RefundsFilter {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

// Association Revenue
export interface AssociationRevenueItem {
  vendorId: string;
  vendorName: string;
  shopName: string;
  bookings: number;
  revenue: number;
}

export interface AssociationRevenueResponse {
  vendors: AssociationRevenueItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalRevenue: number;
}

export interface AssociationRevenueFilter {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// Payouts
// PENDING  → super admin sent, waiting for association admin to verify
// CONFIRMED → association admin confirmed the amount was received
// DISPUTED  → association admin says the amount was NOT received
export type PayoutStatus = 'PENDING' | 'CONFIRMED' | 'DISPUTED';

export interface PayoutEarningSummary {
  totalEarned: number;
  totalConfirmed: number;
  pendingVerification: number;
  disputed: number;
  totalBookings: number;
}

export interface PayoutHistoryItem {
  id: string;
  associationAdminId: string;
  associationAdminName: string;
  amount: number;
  bookingCount: number;
  sentAt: string;
  verifiedAt?: string;
  status: PayoutStatus;
  note?: string;
  disputeReason?: string;
}

export interface PayoutHistoryResponse {
  payouts: PayoutHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PayoutHistoryFilter {
  page?: number;
  limit?: number;
  status?: string;
  associationAdminId?: string;
}

export interface SendPayoutInput {
  amount: number;
  note?: string;
}

export interface VerifyPayoutInput {
  status: 'CONFIRMED' | 'DISPUTED';
  disputeReason?: string;
}

// For super admin: association admin earnings summary (to know who to pay)
export interface AssociationAdminEarning {
  associationAdminId: string;
  associationAdminName: string;
  totalBookings: number;
  totalEarned: number;
  totalPaid: number;
  pendingAmount: number;
}
