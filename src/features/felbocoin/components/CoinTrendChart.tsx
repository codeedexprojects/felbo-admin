'use client';

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
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
} from 'recharts';
import { useCoinTrend } from '../hooks';
import { useMounted } from '@/hooks/use-mounted';
import { CoinTrendGranularity } from '../types';

type Period = '7d' | '30d' | '3m' | 'custom';

const PERIODS: { label: string; value: Period }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: 'Custom', value: 'custom' },
];

const GRANULARITIES: { label: string; value: CoinTrendGranularity }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

function toIso(date: Date): string {
  return date.toISOString();
}

// Backend returns different formats per granularity — parse each correctly
function formatTrendLabel(dateStr: string, granularity: CoinTrendGranularity): string {
  if (granularity === 'weekly') {
    // e.g. "2024-W03" → "W03 '24"
    const m = dateStr.match(/^(\d{4})-W(\d{2})$/);
    if (m) return `W${m[2]} '${m[1].slice(2)}`;
    return dateStr;
  }
  if (granularity === 'monthly') {
    // e.g. "2024-01" → "Jan '24"
    const m = dateStr.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, 1);
      return format(d, "MMM ''yy");
    }
    return dateStr;
  }
  if (granularity === 'yearly') {
    return dateStr; // "2024"
  }
  // daily: "2024-01-15" — append time to force local-time parse
  const d = new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? dateStr : format(d, 'dd MMM');
}

function getPeriodDates(period: Period): { from: Date; to: Date } {
  const now = new Date();
  if (period === '7d') return { from: subDays(startOfDay(now), 6), to: endOfDay(now) };
  if (period === '30d') return { from: subDays(startOfDay(now), 29), to: endOfDay(now) };
  if (period === '3m') return { from: subMonths(startOfDay(now), 3), to: endOfDay(now) };
  return { from: subDays(startOfDay(now), 29), to: endOfDay(now) };
}

function SkeletonChart() {
  return (
    <div className="flex h-56 items-end gap-1 px-2">
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
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CoinTrendChart() {
  const [period, setPeriod] = useState<Period>('30d');
  const [granularity, setGranularity] = useState<CoinTrendGranularity>('daily');
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const periodDates = getPeriodDates(period);
  const fromDate = period === 'custom' ? (customFrom ?? periodDates.from) : periodDates.from;
  const toDate = period === 'custom' ? (customTo ?? periodDates.to) : periodDates.to;

  const fromIso = toIso(fromDate);
  const toIso_ = toIso(toDate);

  const { data: raw = [], isLoading } = useCoinTrend(fromIso, toIso_, granularity);
  const mounted = useMounted();

  if (!mounted) return null;

  const chartData = raw.map((bucket) => ({
    ...bucket,
    label: formatTrendLabel(bucket.date, granularity),
  }));

  const totalEarned = raw.reduce((s, d) => s + d.coinsEarned, 0);
  const totalRedeemed = raw.reduce((s, d) => s + d.coinsRedeemed, 0);
  const netFlow = raw.reduce((s, d) => s + d.netFlow, 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Coin Flow Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Coins earned, redeemed and net flow over time
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Granularity */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
            {GRANULARITIES.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className={
                  granularity === g.value
                    ? 'rounded-md bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm border border-border/60 transition-all'
                    : 'rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
                }
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Period */}
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

      {/* Custom date range */}
      {period === 'custom' && (
        <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                    !customFrom && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  {customFrom ? format(customFrom, 'dd MMM yyyy') : 'From Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ModernDatePicker
                  selected={customFrom}
                  onSelect={(date) => setCustomFrom(date ? startOfDay(date) : undefined)}
                />
              </PopoverContent>
            </Popover>
            {customFrom && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setCustomFrom(undefined)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <span className="text-muted-foreground text-sm">–</span>

          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                    !customTo && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  {customTo ? format(customTo, 'dd MMM yyyy') : 'To Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ModernDatePicker
                  selected={customTo}
                  onSelect={(date) => setCustomTo(date ? endOfDay(date) : undefined)}
                />
              </PopoverContent>
            </Popover>
            {customTo && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setCustomTo(undefined)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {(customFrom || customTo) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground ml-1"
              onClick={() => {
                setCustomFrom(undefined);
                setCustomTo(undefined);
              }}
            >
              <X className="h-3.5 w-3.5" />
              Clear dates
            </Button>
          )}
        </div>
      )}

      {/* Summary mini-stats */}
      {!isLoading && (
        <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
          {[
            {
              label: 'Total Earned',
              value: totalEarned.toLocaleString(),
              color: 'text-emerald-600',
            },
            {
              label: 'Total Redeemed',
              value: totalRedeemed.toLocaleString(),
              color: 'text-amber-600',
            },
            {
              label: 'Net Flow',
              value: (netFlow >= 0 ? '+' : '') + netFlow.toLocaleString(),
              color: netFlow >= 0 ? 'text-blue-600' : 'text-red-600',
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
        ) : chartData.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            No trend data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEarned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRedeemed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNetFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="coinsEarned"
                name="Earned"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradEarned)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="coinsRedeemed"
                name="Redeemed"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradRedeemed)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="netFlow"
                name="Net Flow"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradNetFlow)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
