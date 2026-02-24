export type IssueStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

export type IssueType =
  | 'SHOP_CLOSED'
  | 'BARBER_UNAVAILABLE'
  | 'SERVICE_NOT_PROVIDED'
  | 'QUALITY_ISSUE'
  | 'OTHER';

export type RefundStatus = 'NONE' | 'PENDING' | 'ISSUED' | 'FAILED';

export interface Issue {
  id: string;
  bookingId: string;
  userId: string;
  shopId: string;
  vendorId: string;
  barberId: string | null;
  type: IssueType;
  description: string;
  status: IssueStatus;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueDetail {
  id: string;
  bookingId: string;
  user: { id: string; name: string; phone: string } | null;
  vendor: { id: string; name: string; phone: string; isFlagged: boolean } | null;
  shop: {
    id: string;
    name: string;
    phone: string;
    address: { area: string; city: string };
  } | null;
  barberId: string | null;
  type: IssueType;
  description: string;
  status: IssueStatus;
  refundStatus: RefundStatus;
  userLocation: { lat: number; lng: number } | null;
  photoUrl: string | null;
  reviewedBy: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueStatusCounts {
  total: number;
  open: number;
  resolved: number;
  rejected: number;
}

export interface IssueListResponse {
  issues: Issue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: IssueStatusCounts;
}

export interface IssueListFilter {
  page?: number;
  limit?: number;
  status?: IssueStatus;
  type?: IssueType;
}

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  SHOP_CLOSED: 'Shop Closed',
  BARBER_UNAVAILABLE: 'Barber Unavailable',
  SERVICE_NOT_PROVIDED: 'Service Not Provided',
  QUALITY_ISSUE: 'Quality Issue',
  OTHER: 'Other',
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  NONE: 'None',
  PENDING: 'Pending',
  ISSUED: 'Issued',
  FAILED: 'Failed',
};
