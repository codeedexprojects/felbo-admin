'use client';

import { TrendingUp, Calendar, CalendarDays, IndianRupee } from 'lucide-react';
import { useRevenueOverview } from '../hooks';
import { useMounted } from '@/hooks/use-mounted';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
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
    description: 'Last 7 days',
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

export function RevenueOverviewCards() {
  const { data, isLoading } = useRevenueOverview();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
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
              {isLoading ? '—' : formatCurrency(data?.[card.key] ?? 0)}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
