'use client';

import { useState, useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { IndianRupee, Receipt, Calendar as CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { TablePagination } from '@/components/ui/table-pagination';
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
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

  const handleDateChange = (date: Date | undefined, key: 'from' | 'to') => {
    const val = date ? format(date, 'yyyy-MM-dd') : undefined;
    setFilter((prev) => ({ ...prev, [key]: val, page: 1 }));
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-10 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !filter.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {filter.from ? format(new Date(filter.from), 'dd MMM yyyy') : 'From Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker
                selected={filter.from ? new Date(filter.from) : undefined}
                onSelect={(date) => handleDateChange(date, 'from')}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-sm">–</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-10 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !filter.to && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {filter.to ? format(new Date(filter.to), 'dd MMM yyyy') : 'To Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker
                selected={filter.to ? new Date(filter.to) : undefined}
                onSelect={(date) => handleDateChange(date, 'to')}
              />
            </PopoverContent>
          </Popover>
        </div>

        {(typeFilter !== 'ALL' || filter.from || filter.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter('ALL');
              setFilter({ page: 1, limit: 10 });
            }}
            className="h-10 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {(data?.total ?? 0) > 0 ? `${data?.total} refunds` : 'No refunds'}
        </p>
        <TablePagination
          pageIndex={(filter.page ?? 1) - 1}
          totalPages={data?.totalPages || 1}
          onPageChange={(idx) => setFilter((prev) => ({ ...prev, page: idx + 1 }))}
        />
      </div>
    </div>
  );
}
