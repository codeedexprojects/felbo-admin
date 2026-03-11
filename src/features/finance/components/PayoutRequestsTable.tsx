'use client';

import React, { useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import {
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePayoutDashboard, usePayouts, useCreatePayout } from '../hooks';
import { PayoutItemDto, PayoutStatus, PayoutListFilter } from '../types';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: PayoutStatus }) {
  if (status === 'ACCEPTED')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
        <CheckCircle2 className="h-3 w-3" /> Accepted
      </span>
    );
  if (status === 'REJECTED')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 border border-rose-100">
        <AlertTriangle className="h-3 w-3" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 border border-amber-100">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </TableCell>
      ))}
    </TableRow>
  );
}

const columns: ColumnDef<PayoutItemDto>[] = [
  {
    header: 'Date',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium">{fmtDate(getValue<string>())}</span>
    ),
  },
  {
    header: 'Bookings',
    accessorKey: 'bookingCount',
    cell: ({ getValue }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {getValue<number>().toLocaleString('en-IN')}
      </span>
    ),
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ getValue }) => (
      <span className="text-sm font-semibold tabular-nums">{fmt(getValue<number>())}</span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => <StatusBadge status={getValue<PayoutStatus>()} />,
  },
  {
    header: 'Processed At',
    accessorKey: 'processedAt',
    cell: ({ getValue }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {fmtDate(getValue<string | null>())}
      </span>
    ),
  },
  {
    header: 'Rejection Reason',
    accessorKey: 'rejectionReason',
    cell: ({ getValue }) => {
      const reason = getValue<string | null>();
      if (!reason) return <span className="text-muted-foreground/40 text-sm">—</span>;
      return (
        <span className="text-xs text-rose-600 max-w-[200px] block truncate" title={reason}>
          {reason}
        </span>
      );
    },
  },
];

export function PayoutRequestsTable() {
  const mounted = useMounted();
  const [filter, setFilter] = useState<PayoutListFilter>({ page: 1, limit: 10 });
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: dashboard, isLoading: dashLoading } = usePayoutDashboard();
  const { data, isLoading, isError } = usePayouts(filter);
  const createMutation = useCreatePayout();

  const table = useReactTable({
    data: data?.payouts ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  if (!mounted) return null;

  const statCards = [
    {
      label: 'Amount Owed',
      value: dashLoading ? '—' : fmt(dashboard?.owedAmount ?? 0),
      icon: IndianRupee,
      bg: 'bg-rose-50',
      iconClass: 'text-rose-600',
      border: 'border-rose-100',
      highlight: true,
    },
    {
      label: 'Total Commission',
      value: dashLoading ? '—' : fmt(dashboard?.totalCommission ?? 0),
      icon: TrendingUp,
      bg: 'bg-blue-50',
      iconClass: 'text-blue-600',
      border: 'border-blue-100',
      highlight: false,
    },
    {
      label: 'Total Paid Out',
      value: dashLoading ? '—' : fmt(dashboard?.totalPaid ?? 0),
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      iconClass: 'text-emerald-600',
      border: 'border-emerald-100',
      highlight: false,
    },
    {
      label: 'Last Payout',
      value: dashLoading ? '—' : fmtDate(dashboard?.lastPayoutDate ?? null),
      icon: Calendar,
      bg: 'bg-violet-50',
      iconClass: 'text-violet-600',
      border: 'border-violet-100',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              'flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm',
              card.border,
              card.highlight && 'ring-1 ring-rose-200'
            )}
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                card.bg
              )}
            >
              <card.icon className={cn('h-5 w-5', card.iconClass)} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{card.label}</p>
              <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header row: filter + send payout button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          value={filter.status ?? 'ALL'}
          onValueChange={(v) =>
            setFilter((f) => ({
              ...f,
              status: v === 'ALL' ? undefined : (v as PayoutStatus),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="h-9 w-40 text-sm border-border/60">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <AlertDialog
          open={isAlertOpen}
          onOpenChange={(open) => {
            if (!open) createMutation.reset();
            setIsAlertOpen(open);
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              className="gap-2 bg-black text-white hover:bg-black/90"
              disabled={!dashboard?.owedAmount || dashboard.owedAmount <= 0}
            >
              <Send className="h-4 w-4" />
              Send Payout
              {dashboard?.owedAmount ? ` (${fmt(dashboard.owedAmount)})` : ''}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Payout</AlertDialogTitle>
              <AlertDialogDescription>
                This will create a payout of{' '}
                <span className="font-semibold text-foreground">
                  {fmt(dashboard?.owedAmount ?? 0)}
                </span>{' '}
                to the association admin. The association admin will be notified and must confirm
                receipt. Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>

            {createMutation.isError && (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100 flex items-start gap-2 mt-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : 'Failed to send payout'}
                </p>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                disabled={createMutation.isPending}
                onClick={() => {
                  createMutation.mutate(undefined, {
                    onSuccess: () => {
                      setIsAlertOpen(false);
                    },
                  });
                }}
                className="bg-black hover:bg-black/90"
              >
                {createMutation.isPending ? 'Processing…' : 'Yes, Send Payout'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Payout history table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent border-border/40">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-rose-500">
                    Failed to load payout history. Please try again.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No payout records yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-medium text-foreground">{filter.page}</span> of{' '}
            <span className="font-medium text-foreground">{data?.totalPages ?? '—'}</span>
            {' · '}
            <span className="font-medium text-foreground">{data?.total ?? 0}</span> total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={(filter.page ?? 1) <= 1}
              onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={(filter.page ?? 1) >= (data?.totalPages ?? 1)}
              onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
