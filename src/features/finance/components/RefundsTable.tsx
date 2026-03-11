'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { IndianRupee, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRefundHistory, useFinanceSummary } from '../hooks';
import { RefundHistoryItemDto, RefundHistoryFilter, RefundType } from '../types';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

function RefundTypeBadge({ type }: { type: RefundType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        type === 'ISSUE'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      )}
    >
      {type === 'ISSUE' ? 'Issue' : 'Cancellation'}
    </span>
  );
}

const TYPE_OPTIONS: { label: string; value: RefundType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Issue', value: 'ISSUE' },
  { label: 'Cancellation', value: 'CANCELLATION' },
];

export function RefundsTable() {
  const mounted = useMounted();
  const [filter, setFilter] = useState<RefundHistoryFilter>({ page: 1, limit: 10 });
  const [typeFilter, setTypeFilter] = useState<RefundType | 'ALL'>('ALL');

  const { data: summary } = useFinanceSummary();
  const { data, isLoading, isError } = useRefundHistory(filter);

  const columns: ColumnDef<RefundHistoryItemDto>[] = useMemo(
    () => [
      {
        header: 'Booking',
        accessorKey: 'bookingNumber',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-foreground">{row.original.bookingNumber}</p>
            <p className="text-[11px] text-muted-foreground">{row.original.shopName}</p>
          </div>
        ),
      },
      {
        header: 'User',
        accessorKey: 'userName',
        cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
      },
      {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ getValue }) => <RefundTypeBadge type={getValue<RefundType>()} />,
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold text-red-600 tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        header: 'Reason',
        accessorKey: 'reason',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.issueType ?? row.original.reason ?? '—'}
          </span>
        ),
      },
      {
        header: 'Refunded At',
        accessorKey: 'refundedAt',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums">{formatDate(getValue<string>())}</span>
        ),
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.refunds || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    state: {
      pagination: {
        pageIndex: (filter.page ?? 1) - 1,
        pageSize: filter.limit ?? 10,
      },
    },
    onPaginationChange: (updater) => {
      const current = { pageIndex: (filter.page ?? 1) - 1, pageSize: filter.limit ?? 10 };
      const next = typeof updater === 'function' ? updater(current) : updater;
      setFilter((prev) => ({ ...prev, page: next.pageIndex + 1, limit: next.pageSize }));
    },
  });

  if (!mounted) return null;

  const handleTypeChange = (value: RefundType | 'ALL') => {
    setTypeFilter(value);
    setFilter((prev) => ({ ...prev, type: value === 'ALL' ? undefined : value, page: 1 }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>, key: 'from' | 'to') => {
    setFilter((prev) => ({ ...prev, [key]: e.target.value || undefined, page: 1 }));
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 max-w-sm">
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-card p-4 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <IndianRupee className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total Refunds</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {summary ? formatCurrency(summary.refundStats.total) : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-card p-4 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
            <Receipt className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">This Month</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {summary ? formatCurrency(summary.refundStats.thisMonth) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        {/* Type filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTypeChange(opt.value)}
              className={
                typeFilter === opt.value
                  ? 'rounded-md bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm border border-border/60 transition-all'
                  : 'rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors'
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filter.from || ''}
            onChange={(e) => handleDateChange(e, 'from')}
            className="h-10 rounded-md border border-border/60 bg-muted/30 px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="date"
            value={filter.to || ''}
            onChange={(e) => handleDateChange(e, 'to')}
            className="h-10 rounded-md border border-border/60 bg-muted/30 px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
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
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-red-500">
                    Failed to load refund data. Please try refreshing.
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
                    No refund records found for the selected filters.
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
              {data?.total === 0 ? 0 : ((filter.page ?? 1) - 1) * (filter.limit ?? 10) + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">
              {Math.min((filter.page ?? 1) * (filter.limit ?? 10), data?.total ?? 0)}
            </span>{' '}
            of <span className="font-medium text-foreground">{data?.total ?? 0}</span> refunds
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
    </div>
  );
}
