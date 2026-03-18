'use client';

import { TrendingUp, Calendar, CalendarDays, IndianRupee } from 'lucide-react';
import { useFinanceSummary } from '../hooks';
import { useMounted } from '@/hooks/use-mounted';
import { FinanceSummaryPeriodDto } from '../types';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const cards = [
  {
    key: 'today' as const,
    label: "Today's Revenue",
    description: "Based on today's bookings",
    icon: IndianRupee,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    key: 'thisWeek' as const,
    label: 'This Week',
    description: 'Mon – now',
    icon: Calendar,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    key: 'thisMonth' as const,
    label: 'This Month',
    description: 'Current month',
    icon: CalendarDays,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    key: 'total' as const,
    label: 'Total Revenue',
    description: 'All time',
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
];

/**
 * When `asGridItems` is true, renders bare card fragments so a parent grid
 * can own the layout (used alongside AssociationCommissionCard in a 5-col grid).
 */
export function RevenueOverviewCards({ asGridItems = false }: { asGridItems?: boolean }) {
  const { data, isLoading } = useFinanceSummary();
  const mounted = useMounted();

  if (!mounted) return null;

  const cardEls = cards.map((card) => {
    const period: FinanceSummaryPeriodDto | undefined = data?.[card.key];
    return (
      <div
        key={card.key}
        className={`flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm ${card.border}`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
        >
          <card.icon className={`h-5 w-5 ${card.color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{card.label}</p>
          <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
            {isLoading ? '—' : formatCurrency(period?.revenue ?? 0)}
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            {isLoading
              ? card.description
              : `${(period?.bookingCount ?? 0).toLocaleString('en-IN')} bookings`}
          </p>
        </div>
      </div>
    );
  });

  if (asGridItems) return <>{cardEls}</>;

  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{cardEls}</div>;
}
