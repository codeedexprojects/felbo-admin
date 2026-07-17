'use client';

import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  index = 0,
}: {
  title: string;
  value: string;
  icon?: React.ElementType;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
  index?: number;
}) {
  const colorStyles = useMemo(() => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'violet':
        return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  }, [color]);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-border"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background Gradient Effect */}
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20',
          colorStyles.split(' ')[0].replace('/10', '')
        )}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border shadow-none transition-colors',
            colorStyles
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
      </div>
    </div>
  );
}
