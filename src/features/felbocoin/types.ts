export type CoinTransactionType =
  | 'COIN_EARNED'
  | 'COIN_REDEEMED'
  | 'COIN_REFUND'
  | 'COIN_REVERSAL'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT';

export type CoinTransactionDirection = 'CREDIT' | 'DEBIT';
export type CoinTrendGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AdminCoinStats {
  totalCoinsInCirculation: number;
  totalUsersWithCoins: number;
  totalTransactions: number;
  totalEarned: number;
  totalRedeemed: number;
  totalRefunded: number;
  totalReversed: number;
  totalAdminCredit: number;
  totalAdminDebit: number;
  netCoinsIssued: number;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: CoinTransactionType;
  direction: CoinTransactionDirection;
  coins: number;
  balanceBefore: number;
  balanceAfter: number;
  bookingNumber?: string;
  adminId?: string;
  description: string;
  createdAt: string;
}

export interface AdminTransactionList {
  transactions: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CoinTrendBucket {
  date: string;
  coinsEarned: number;
  coinsRedeemed: number;
  coinsRefunded: number;
  coinsReversed: number;
  adminCredit: number;
  adminDebit: number;
  netFlow: number;
}

export interface LeaderboardUser {
  userId: string;
  name: string;
  phone: string;
  email: string | null;
  felboCoinBalance: number;
}

export interface LeaderboardList {
  users: LeaderboardUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminLog {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  adminId: string;
  adminName: string;
  type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT';
  direction: CoinTransactionDirection;
  coins: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface AdminLogList {
  logs: AdminLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionsFilter {
  page: number;
  limit: number;
  search?: string;
  type?: CoinTransactionType;
  direction?: CoinTransactionDirection;
  from?: string;
  to?: string;
}

export interface CoinActionInput {
  coins: number;
  reason: string;
}
