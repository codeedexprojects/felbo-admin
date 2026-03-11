'use client';

import React, { useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { usePayouts, useAcceptPayout, useRejectPayout } from '../hooks';
import { PayoutItemDto, PayoutStatus, PayoutListFilter } from '../types';
import { useMounted } from '@/hooks/use-mounted';

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDate(d: string) {
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

export function PayoutHistoryTable() {
  const mounted = useMounted();
  const [filter, setFilter] = useState<PayoutListFilter>({ page: 1, limit: 10 });
  const [rejectTarget, setRejectTarget] = useState<PayoutItemDto | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, isError } = usePayouts(filter);
  const acceptMutation = useAcceptPayout();
  const rejectMutation = useRejectPayout();

  const columns: ColumnDef<PayoutItemDto>[] = [
    {
      header: 'Sent On',
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
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        if (row.original.status !== 'PENDING') return null;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              disabled={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate(row.original.id)}
            >
              {acceptMutation.isPending ? 'Confirming…' : 'Confirm Receipt'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => {
                setRejectTarget(row.original);
                setRejectReason('');
              }}
            >
              Dispute
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.payouts ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  if (!mounted) return null;

  return (
    <>
      {/* Status filter & Error Banner */}
      <div className="flex flex-col gap-3">
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

        {acceptMutation.isError && (
          <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              {acceptMutation.error instanceof Error
                ? acceptMutation.error.message
                : 'Failed to accept payout'}
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden mt-3">
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
                    No payout records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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

      {/* Reject / Dispute Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dispute Payout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please describe why you are disputing the payout of{' '}
            <span className="font-semibold text-foreground">
              {rejectTarget ? fmt(rejectTarget.amount) : ''}
            </span>
            .
          </p>
          <Textarea
            placeholder="e.g. Amount was not credited to my account within 3 business days…"
            className="resize-none min-h-[100px] text-sm"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          {rejectMutation.isError && (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100 flex items-start gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                {rejectMutation.error instanceof Error
                  ? rejectMutation.error.message
                  : 'Failed to submit dispute'}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                rejectMutation.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (!rejectTarget) return;
                rejectMutation.mutate(
                  { id: rejectTarget.id, rejectionReason: rejectReason.trim() },
                  { onSuccess: () => setRejectTarget(null) }
                );
              }}
            >
              {rejectMutation.isPending ? 'Submitting…' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
