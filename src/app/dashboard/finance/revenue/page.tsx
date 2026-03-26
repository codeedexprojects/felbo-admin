'use client';

import Link from 'next/link';
import { useState } from 'react';
import { History as HistoryIcon, Banknote, BarChart3, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { RevenueOverviewCards } from '@/features/finance/components/RevenueOverviewCards';
import { RevenueReportsTable } from '@/features/finance/components/RevenueReportsTable';
import { AssociationRevenueTable } from '@/features/finance/components/AssociationRevenueTable';
import { AssociationCommissionCard } from '@/features/finance/components/AssociationCommissionCard';
import { RevenueChart } from '@/features/finance/components/RevenueChart';
import { RegistrationsTable } from '@/features/finance/components/RegistrationsTable';
import { useAuthStore } from '@/stores/authStore';

type Tab = 'revenue' | 'registrations';

const TABS: { label: string; value: Tab; icon: React.ElementType }[] = [
  { label: 'Booking Revenue', value: 'revenue', icon: BarChart3 },
  { label: 'Vendor Registrations', value: 'registrations', icon: UserPlus },
];

export default function RevenuePage() {
  const { admin } = useAuthStore();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<Tab>('revenue');

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Vendors Revenue"
          description="Revenue generated from vendors under your association."
          action={
            <Button asChild size="sm" className="gap-2 bg-black text-white hover:bg-black/90">
              <Link href="/dashboard/finance/payouts">
                <Banknote className="h-4 w-4" />
                My Payouts
              </Link>
            </Button>
          }
        />
        <AssociationRevenueTable />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview cards + commission card */}
      <div className="space-y-4">
        <PageHeader
          title="Revenue Overview"
          description="Platform-wide revenue metrics."
          action={
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/dashboard/finance/payouts">
                  <Banknote className="h-4 w-4" />
                  Payout Requests
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-2 bg-black text-white hover:bg-black/90">
                <Link href="/dashboard/finance/refunds">
                  <HistoryIcon className="h-4 w-4" />
                  Refund Tracking
                </Link>
              </Button>
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <RevenueOverviewCards asGridItems />
          <AssociationCommissionCard />
        </div>
      </div>

      {/* Revenue chart */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Revenue Trend</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daily breakdown of gross revenue, association commissions, and net platform earnings.
          </p>
        </div>
        <RevenueChart />
      </div>

      {/* Tables Section with Tabs */}
      <div className="space-y-4 pt-4">
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

        <div className="mt-4">
          {activeTab === 'revenue' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-base font-semibold text-foreground">Revenue Reports</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Daily revenue breakdown from shop bookings with filters.
                </p>
              </div>
              <RevenueReportsTable />
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-base font-semibold text-foreground">Vendor Registrations</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track incoming registration fees from independent vendors.
                </p>
              </div>
              <RegistrationsTable />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
