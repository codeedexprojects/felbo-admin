import {
  RevenueOverview,
  RevenueReportsFilter,
  RevenueReportsResponse,
  RefundsFilter,
  RefundsResponse,
  AssociationRevenueFilter,
  AssociationRevenueResponse,
  PayoutEarningSummary,
  PayoutHistoryItem,
  PayoutHistoryFilter,
  PayoutHistoryResponse,
  SendPayoutInput,
  VerifyPayoutInput,
  AssociationAdminEarning,
} from './types';

// --- Dummy data generators ---

const generateDummyRevenueOverview = (): RevenueOverview => ({
  today: 1200,
  thisWeek: 8750,
  thisMonth: 34200,
  total: 512000,
});

const generateDummyRevenueReports = (): RevenueReportsResponse['reports'] => {
  return Array.from({ length: 20 }).map((_, i) => {
    const date = new Date(Date.now() - i * 86400000);
    return {
      date: date.toISOString().split('T')[0],
      bookings: Math.floor(Math.random() * 15) + 1,
      amount: (Math.floor(Math.random() * 15) + 1) * 150,
      vendorId: `v-${(i % 5) + 1}`,
      vendorName: `Vendor ${(i % 5) + 1}`,
    };
  });
};

const generateDummyRefunds = () => {
  const types = ['WALLET', 'ORIGINAL'] as const;
  const statuses = ['COMPLETED', 'PENDING', 'FAILED'] as const;

  return Array.from({ length: 18 }).map((_, i) => ({
    id: `ref-${i + 1}`,
    bookingId: `bk-${i + 1}`,
    bookingNumber: `FLB${1000 + i}`,
    user: {
      id: `u-${i}`,
      name: `Customer ${i + 1}`,
      phone: `+91 9000000${String(i).padStart(3, '0')}`,
    },
    amount: [10, 50, 100, 150][i % 4],
    type: types[i % 2],
    status: statuses[i % 3],
    reason: i % 2 === 0 ? 'User requested cancellation' : 'Vendor cancelled the appointment',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    processedAt:
      statuses[i % 3] === 'COMPLETED'
        ? new Date(Date.now() - i * 86400000 + 3600000).toISOString()
        : undefined,
  }));
};

const generateDummyAssociationRevenue = () => {
  return Array.from({ length: 8 }).map((_, i) => ({
    vendorId: `v-${i + 1}`,
    vendorName: `Owner Name ${i + 1}`,
    shopName: `Quality Barbers ${i + 1}`,
    bookings: Math.floor(Math.random() * 40) + 5,
    revenue: (Math.floor(Math.random() * 40) + 5) * 150,
  }));
};

// --- API Functions ---

export const getRevenueOverview = async (): Promise<RevenueOverview> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return generateDummyRevenueOverview();
};

export const getRevenueReports = async (
  filters: RevenueReportsFilter
): Promise<RevenueReportsResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  let reports = generateDummyRevenueReports();

  if (filters.startDate) {
    reports = reports.filter((r) => r.date >= filters.startDate!);
  }
  if (filters.endDate) {
    reports = reports.filter((r) => r.date <= filters.endDate!);
  }
  if (filters.vendorId) {
    reports = reports.filter((r) => r.vendorId === filters.vendorId);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const totalAmount = reports.reduce((sum, r) => sum + r.amount, 0);
  const paginated = reports.slice(start, start + limit);

  return {
    reports: paginated,
    total: reports.length,
    page,
    limit,
    totalPages: Math.ceil(reports.length / limit),
    totalAmount,
  };
};

export const getRefunds = async (filters: RefundsFilter): Promise<RefundsResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 700));

  let refunds = generateDummyRefunds();

  if (filters.type && filters.type !== 'ALL') {
    refunds = refunds.filter((r) => r.type === filters.type);
  }
  if (filters.status && filters.status !== 'ALL') {
    refunds = refunds.filter((r) => r.status === filters.status);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const paginated = refunds.slice(start, start + limit);

  return {
    refunds: paginated,
    total: refunds.length,
    page,
    limit,
    totalPages: Math.ceil(refunds.length / limit),
  };
};

// --- Payout dummy data ---

const ASSOC_ADMINS = [
  { id: 'aa-1', name: 'Ravi Kumar' },
  { id: 'aa-2', name: 'Sunita Devi' },
  { id: 'aa-3', name: 'Mohammed Ali' },
];

const generateDummyPayoutHistory = (): PayoutHistoryItem[] => {
  const statuses: PayoutHistoryItem['status'][] = ['PENDING', 'CONFIRMED', 'DISPUTED'];
  return Array.from({ length: 15 }).map((_, i) => {
    const admin = ASSOC_ADMINS[i % 3];
    const status = statuses[i % 3];
    const bookingCount = Math.floor(Math.random() * 50) + 10;
    return {
      id: `payout-${i + 1}`,
      associationAdminId: admin.id,
      associationAdminName: admin.name,
      amount: bookingCount * 2,
      bookingCount,
      sentAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      verifiedAt:
        status !== 'PENDING' ? new Date(Date.now() - i * 86400000 * 2).toISOString() : undefined,
      status,
      note: i % 3 === 0 ? 'Monthly payout' : undefined,
      disputeReason: status === 'DISPUTED' ? 'Amount not received in bank account.' : undefined,
    };
  });
};

// Association admin's own earnings summary
export const getPayoutEarningSummary = async (): Promise<PayoutEarningSummary> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    totalEarned: 1240,
    totalConfirmed: 600,
    pendingVerification: 200,
    disputed: 40,
    totalBookings: 620,
  };
};

// Shared: super admin sees all, association admin sees only their own
export const getPayoutHistory = async (
  filters: PayoutHistoryFilter
): Promise<PayoutHistoryResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 700));

  let payouts = generateDummyPayoutHistory();

  if (filters.status && filters.status !== 'ALL') {
    payouts = payouts.filter((p) => p.status === filters.status);
  }
  if (filters.associationAdminId) {
    payouts = payouts.filter((p) => p.associationAdminId === filters.associationAdminId);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const paginated = payouts.slice(start, start + limit);

  return {
    payouts: paginated,
    total: payouts.length,
    page,
    limit,
    totalPages: Math.ceil(payouts.length / limit),
  };
};

// Super admin sends payout to an association admin
export const sendPayout = async (input: SendPayoutInput): Promise<PayoutHistoryItem> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: `payout-new-${Date.now()}`,
    associationAdminId: 'aa-system',
    associationAdminName: 'Association Admin',
    amount: input.amount,
    bookingCount: Math.floor(input.amount / 2),
    sentAt: new Date().toISOString(),
    status: 'PENDING',
    note: input.note,
  };
};

// Association admin verifies receipt (CONFIRMED) or disputes (DISPUTED)
export const verifyPayout = async (
  id: string,
  input: VerifyPayoutInput
): Promise<PayoutHistoryItem> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    id,
    associationAdminId: 'aa-current',
    associationAdminName: 'Current Association Admin',
    amount: 100,
    bookingCount: 50,
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    verifiedAt: new Date().toISOString(),
    status: input.status,
    disputeReason: input.disputeReason,
  };
};

// Super admin: per-association-admin earnings overview (to know who to pay)
export const getAssociationAdminEarnings = async (): Promise<AssociationAdminEarning[]> => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return ASSOC_ADMINS.map((admin, i) => {
    const totalBookings = (i + 1) * 80 + 40;
    const totalEarned = totalBookings * 2;
    const totalPaid = Math.floor(totalEarned * 0.6);
    return {
      associationAdminId: admin.id,
      associationAdminName: admin.name,
      totalBookings,
      totalEarned,
      totalPaid,
      pendingAmount: totalEarned - totalPaid,
    };
  });
};

export const getAssociationRevenue = async (
  filters: AssociationRevenueFilter
): Promise<AssociationRevenueResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const vendors = generateDummyAssociationRevenue();

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const totalRevenue = vendors.reduce((sum, v) => v.revenue + sum, 0);
  const paginated = vendors.slice(start, start + limit);

  return {
    vendors: paginated,
    total: vendors.length,
    page,
    limit,
    totalPages: Math.ceil(vendors.length / limit),
    totalRevenue,
  };
};
