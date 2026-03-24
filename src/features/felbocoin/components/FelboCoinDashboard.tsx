'use client';

import { useState } from 'react';
import {
  Coins,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  TrendingUp,
  ShieldCheck,
  Receipt,
  Trophy,
  History,
} from 'lucide-react';

import { useCoinStats } from '../hooks';
import { useMounted } from '@/hooks/use-mounted';
import { CoinTrendChart } from './CoinTrendChart';
import { TransactionsTable } from './TransactionsTable';
import { LeaderboardTable } from './LeaderboardTable';
import { AdminLogsTable } from './AdminLogsTable';

type Tab = 'transactions' | 'leaderboard' | 'admin-logs';

const TABS: { label: string; value: Tab; icon: React.ElementType }[] = [
  { label: 'Transactions', value: 'transactions', icon: Receipt },
  { label: 'Leaderboard', value: 'leaderboard', icon: Trophy },
  { label: 'Admin Logs', value: 'admin-logs', icon: History },
];

function StatSkeleton() {
  return <div className="h-6 w-20 animate-pulse rounded bg-muted" />;
}

export function FelboCoinDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const { data: stats, isLoading: statsLoading } = useCoinStats();
  const mounted = useMounted();

  if (!mounted) return null;

  const statCards = [
    {
      label: 'In Circulation',
      value: stats?.totalCoinsInCirculation?.toLocaleString() ?? '—',
      icon: Coins,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Users with Coins',
      value: stats?.totalUsersWithCoins?.toLocaleString() ?? '—',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Earned',
      value: stats?.totalEarned?.toLocaleString() ?? '—',
      icon: ArrowUpRight,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Redeemed',
      value: stats?.totalRedeemed?.toLocaleString() ?? '—',
      icon: ArrowDownRight,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Total Refunded',
      value: stats?.totalRefunded?.toLocaleString() ?? '—',
      icon: RotateCcw,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Admin Credited',
      value: stats?.totalAdminCredit?.toLocaleString() ?? '—',
      icon: ShieldCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Admin Debited',
      value: stats?.totalAdminDebit?.toLocaleString() ?? '—',
      icon: ShieldCheck,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Net Issued',
      value:
        stats?.netCoinsIssued !== undefined
          ? (stats.netCoinsIssued >= 0 ? '+' : '') + stats.netCoinsIssued.toLocaleString()
          : '—',
      icon: TrendingUp,
      color:
        stats?.netCoinsIssued !== undefined && stats.netCoinsIssued < 0
          ? 'text-red-600'
          : 'text-blue-600',
      bg:
        stats?.netCoinsIssued !== undefined && stats.netCoinsIssued < 0
          ? 'bg-red-50'
          : 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {statsLoading ? <StatSkeleton /> : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <CoinTrendChart />

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card p-1 shadow-sm w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'transactions' && <TransactionsTable />}
        {activeTab === 'leaderboard' && <LeaderboardTable />}
        {activeTab === 'admin-logs' && <AdminLogsTable />}
      </div>
    </div>
  );
}
