import { BookingListItem } from '../bookings/types';

export interface ListUsersFilter {
  search?: string;
  status?: 'ACTIVE' | 'BLOCKED';
  page: number;
  limit: number;
}

export interface UserListItem {
  slNo: number;
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  walletBalance: number;
  cancellationCount: number;
  lastLoginAt: string | null;
  registeredAt: string;
}

export interface UserStatusCounts {
  total: number;
  active: number;
  blocked: number;
}

export interface ListUsersResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: UserStatusCounts;
}

export interface UserIssue {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface UserDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  profileUrl: string | null;
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  blockReason: string | null;
  walletBalance: number;
  cancellationCount: number;
  registeredAt: string;
  lastLoginAt: string | null;
  issuesReported: UserIssue[];
  issueCount: number;
  favorites: {
    shopId: string;
    name: string;
    image: string | null;
    rating: number;
  }[];
  recentBookings: BookingListItem[];
}
