export interface DashboardRecentIssue {
  id: string;
  userName: string;
  userProfileUrl: string | null;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

export interface SuperAdminDashboardData {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  todaysBookings: number;
  todaysRevenue: number;
  pendingVerifications: number;
  recentIssues: DashboardRecentIssue[];
}

export interface AssociationAdminDashboardData {
  myVendorsCount: number;
  myVendorsBookings: {
    today: number;
    total: number;
  };
  myVendorsRevenue: number;
}

export interface TopAssociationVendor {
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  vendorProfilePhoto: string | null;
  shopId: string;
  shopName: string;
  shopPhoto: string | null;
  totalBookings: number;
}
