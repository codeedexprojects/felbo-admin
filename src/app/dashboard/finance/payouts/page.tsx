'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { PayoutEarningsSummary } from '@/features/finance/components/PayoutEarningsSummary';
import { PayoutHistoryTable } from '@/features/finance/components/PayoutHistoryTable';
import { PayoutRequestsTable } from '@/features/finance/components/PayoutRequestsTable';
import { useAuthStore } from '@/stores/authStore';

export default function PayoutsPage() {
  const { admin } = useAuthStore();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Payouts"
          description="Track your commission earnings and request payouts."
          action={
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/dashboard/finance/revenue">
                <ArrowLeft className="h-4 w-4" />
                Back to Revenue
              </Link>
            </Button>
          }
        />
        <PayoutEarningsSummary />
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Payout History</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              All your payout requests and their current status.
            </p>
          </div>
          <PayoutHistoryTable />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payout Requests"
        description="Review and process payout requests from association admins."
        action={
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/dashboard/finance/revenue">
              <ArrowLeft className="h-4 w-4" />
              Back to Revenue
            </Link>
          </Button>
        }
      />
      <PayoutRequestsTable />
    </div>
  );
}
