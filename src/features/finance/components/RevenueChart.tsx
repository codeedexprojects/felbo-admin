'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { useRevenueChartData } from '../hooks';
import { useMounted } from '@/hooks/use-mounted';
import { FinancePeriod, RevenueChartPoint } from '../types';

type ViewMode = 'area' | 'bar';

const PERIODS: { label: string; value: FinancePeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom', value: 'custom' },
];

function fmt(n: number) {
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${Number(n.toFixed(2)).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-popover px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {entry.name === 'Bookings'
              ? entry.value.toLocaleString('en-IN')
              : `₹${entry.value.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="flex h-64 items-end gap-1 px-2">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t-sm bg-muted"
          style={{ height: `${30 + ((i * 17) % 55)}%` }}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string, period: FinancePeriod): string {
  const d = new Date(dateStr);
  if (period === 'today') {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function RevenueChart() {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('area');

  const { data: raw = [], isLoading } = useRevenueChartData(
    period,
    from || undefined,
    to || undefined
  );
  const mounted = useMounted();

  if (!mounted) return null;

  const data: (RevenueChartPoint & { label: string })[] = raw.map((p) => ({
    ...p,
    label: formatDate(p.date, period),
  }));

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalBookings = data.reduce((s, d) => s + d.bookingCount, 0);

  const xInterval =
    period === 'today'
      ? 'preserveStartEnd'
      : period === 'week'
        ? 0
        : period === 'month'
          ? 4
          : 'preserveStartEnd';

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily advance payment revenue and booking volume
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
            {(['area', 'bar'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={
                  viewMode === mode
                    ? 'rounded-md bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm border border-border/60 transition-all capitalize'
                    : 'rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors capitalize'
                }
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Period toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={
                  period === p.value
                    ? 'rounded-md bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm border border-border/60 transition-all'
                    : 'rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom date range row */}
      {period === 'custom' && (
        <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-9 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !from && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-3.5 w-3.5" />
                {from ? format(new Date(from), 'dd MMM yyyy') : 'From Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker
                selected={from ? new Date(from) : undefined}
                onSelect={(date) => setFrom(date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-sm">–</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-9 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !to && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-3.5 w-3.5" />
                {to ? format(new Date(to), 'dd MMM yyyy') : 'To Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker
                selected={to ? new Date(to) : undefined}
                onSelect={(date) => setTo(date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Summary mini-stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 divide-x divide-border/40 border-b border-border/40">
          {[
            { label: 'Gross Revenue', value: fmt(totalRevenue), color: 'text-blue-600' },
            {
              label: 'Total Bookings',
              value: totalBookings.toLocaleString('en-IN'),
              color: 'text-emerald-600',
            },
          ].map((s) => (
            <div key={s.label} className="px-5 py-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-base font-bold tabular-nums mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="px-2 pt-4 pb-2">
        {isLoading ? (
          <SkeletonChart />
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No revenue data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            {viewMode === 'area' ? (
              <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval={xInterval}
                />
                <YAxis
                  yAxisId="rev"
                  tickFormatter={(v: number) => fmt(v)}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <YAxis
                  yAxisId="bk"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Area
                  yAxisId="rev"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#gradRevenue)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  yAxisId="bk"
                  type="monotone"
                  dataKey="bookingCount"
                  name="Bookings"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradBookings)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval={xInterval}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v: number) => fmt(v)}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
