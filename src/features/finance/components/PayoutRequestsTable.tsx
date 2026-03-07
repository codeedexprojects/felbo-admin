'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { Send, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePayoutHistory, useSendPayout } from '../hooks';
import { PayoutHistoryItem, PayoutHistoryFilter } from '../types';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

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

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function PayoutStatusBadge({ status }: { status: PayoutHistoryItem['status'] }) {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700',
    CONFIRMED: 'bg-emerald-50 text-emerald-700',
    DISPUTED: 'bg-red-50 text-red-700',
  };
  const labels = { PENDING: 'Pending', CONFIRMED: 'Confirmed', DISPUTED: 'Disputed' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

// --- Send Payout Dialog ---
function SendPayoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { mutate: sendPayout, isPending } = useSendPayout();

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;
    sendPayout(
      { amount: Number(amount), note: note || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setAmount('');
          setNote('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Send Payout</DialogTitle>
          <DialogDescription>
            Enter the payout amount. The association admin will verify receipt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Amount (₹)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Note (optional)</label>
            <Input
              type="text"
              placeholder="e.g. March payout"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !amount || Number(amount) <= 0}>
            {isPending ? 'Sending...' : 'Send Payout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Table ---
export function PayoutRequestsTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<PayoutHistoryFilter>({ page: 1, limit: 10 });
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  const { data, isLoading, isError } = usePayoutHistory(filter);
  const mounted = useMounted();

  const pendingCount = data?.payouts.filter((p) => p.status === 'PENDING').length ?? 0;
  const confirmedCount = data?.payouts.filter((p) => p.status === 'CONFIRMED').length ?? 0;
  const disputedCount = data?.payouts.filter((p) => p.status === 'DISPUTED').length ?? 0;

  const cols = useMemo<ColumnDef<PayoutHistoryItem>[]>(
    () => [
      {
        header: '#',
        id: 'index',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground tabular-nums">{row.index + 1}</span>
        ),
      },
      {
        header: 'Association Admin',
        accessorKey: 'associationAdminName',
        cell: ({ getValue, row }) => (
          <div>
            <p className="text-sm font-medium">{getValue<string>()}</p>
            <p className="text-xs text-muted-foreground">{row.original.associationAdminId}</p>
          </div>
        ),
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold text-emerald-600">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        header: 'Bookings',
        accessorKey: 'bookingCount',
        cell: ({ getValue }) => <span className="text-sm tabular-nums">{getValue<number>()}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <PayoutStatusBadge status={getValue<PayoutHistoryItem['status']>()} />
        ),
      },
      {
        header: 'Note',
        accessorKey: 'note',
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{getValue<string>() || '—'}</span>
        ),
      },
      {
        header: 'Sent On',
        accessorKey: 'sentAt',
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(getValue<string>()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        header: 'Dispute Reason',
        accessorKey: 'disputeReason',
        cell: ({ getValue }) => (
          <span className="text-xs text-red-600 max-w-[160px] line-clamp-2">
            {getValue<string>() || '—'}
          </span>
        ),
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.payouts || [],
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  const handleStatusChange = (value: string) => {
    setFilter((prev) => ({ ...prev, status: value === 'ALL' ? undefined : value, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Pending Verification',
            value: pendingCount,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
          },
          {
            label: 'Confirmed',
            value: confirmedCount,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
          },
          {
            label: 'Disputed',
            value: disputedCount,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm ${card.border}`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold text-foreground">{isLoading ? '—' : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar + Send Payout button */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <Select value={filter.status || 'ALL'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] h-10 text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-sm">
              All Status
            </SelectItem>
            <SelectItem value="PENDING" className="text-sm">
              Pending
            </SelectItem>
            <SelectItem value="CONFIRMED" className="text-sm">
              Confirmed
            </SelectItem>
            <SelectItem value="DISPUTED" className="text-sm">
              Disputed
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="gap-2 bg-black text-white hover:bg-black/90"
          onClick={() => setSendDialogOpen(true)}
        >
          <Send className="h-4 w-4" />
          Send Payout
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/40">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={cols.length} className="h-32 text-center text-red-500">
                    Failed to load payout history. Please try refreshing.
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
                    colSpan={cols.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No payouts sent yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {data?.total === 0
                ? 0
                : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data?.total ?? 0
              )}
            </span>{' '}
            of <span className="font-medium text-foreground">{data?.total ?? 0}</span> payouts
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <SendPayoutDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} />
    </div>
  );
}
