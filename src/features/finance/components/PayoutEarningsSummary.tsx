'use client';

import { IndianRupee, BookOpen, Clock } from 'lucide-react';
import { useAssocPayoutSummary } from '../hooks';
import { useMounted } from '@/hooks/use-mounted';

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function PayoutEarningsSummary() {
  const { data, isLoading } = useAssocPayoutSummary();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Pending payout card */}
      <div className="flex items-center gap-4 rounded-xl border border-amber-100 bg-card p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
          <Clock className="h-5 w-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Pending Payout</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-0.5">
            {isLoading ? '—' : fmt(data?.pendingAmount ?? 0)}
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            Awaiting Super Admin transfer
          </p>
        </div>
      </div>

      {/* Booking count card */}
      <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-card p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <IndianRupee className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Bookings Covered</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-0.5">
            {isLoading ? '—' : (data?.bookingCount ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">₹2 commission per booking</p>
        </div>
      </div>

      {/* Info bar spanning both columns */}
      <div className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Your commission is{' '}
          <span className="font-medium text-foreground">₹2 per completed booking</span> from vendors
          in your association. The Super Admin transfers the pending amount to your bank account
          manually.
        </p>
      </div>
    </div>
  );
}
