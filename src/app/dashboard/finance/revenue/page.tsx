'use client';

import Link from 'next/link';
import { History as HistoryIcon, Banknote } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { RevenueOverviewCards } from '@/features/finance/components/RevenueOverviewCards';
import { RevenueReportsTable } from '@/features/finance/components/RevenueReportsTable';
import { AssociationRevenueTable } from '@/features/finance/components/AssociationRevenueTable';
import { AssociationCommissionCard } from '@/features/finance/components/AssociationCommissionCard';
import { RevenueChart } from '@/features/finance/components/RevenueChart';
import { useAuthStore } from '@/stores/authStore';

export default function RevenuePage() {
  const { admin } = useAuthStore();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

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

      {/* Revenue reports table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Revenue Reports</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daily revenue breakdown with filters and export.
          </p>
        </div>
        <RevenueReportsTable />
      </div>
    </div>
  );
}
