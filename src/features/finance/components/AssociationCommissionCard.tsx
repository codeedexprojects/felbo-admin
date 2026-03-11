'use client';

import { HandCoins } from 'lucide-react';
import { useFinanceSummary } from '../hooks';
import { useMounted } from '@/hooks/use-mounted';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function AssociationCommissionCard() {
  const { data, isLoading } = useFinanceSummary();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-violet-100 bg-card p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
        <HandCoins className="h-5 w-5 text-violet-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">Association Commission</p>
        <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
          {isLoading ? '—' : formatCurrency(data?.associationCommission ?? 0)}
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">
          All time · ₹2 per assoc. booking
        </p>
      </div>
    </div>
  );
}
