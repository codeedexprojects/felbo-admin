'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import {
  Store,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Calendar,
  CalendarDays,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAssocFinanceSummary, useAssocVendorRevenueTable } from '../hooks';
import { VendorRevenueRow, VendorRevenueTableFilter, FinancePeriod } from '../types';
import { useMounted } from '@/hooks/use-mounted';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
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

const PERIOD_OPTIONS: { label: string; value: FinancePeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom', value: 'custom' },
];

export function AssociationRevenueTable() {
  const mounted = useMounted();

  const [filter, setFilter] = useState<VendorRevenueTableFilter>({
    period: 'month',
    page: 1,
    limit: 10,
    sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setFilter((prev) => ({ ...prev, search: searchDebounced || undefined, page: 1 }));
  }, [searchDebounced]);

  const { data: summary, isLoading: summaryLoading } = useAssocFinanceSummary();
  const { data, isLoading, isError } = useAssocVendorRevenueTable(filter);

  const columns: ColumnDef<VendorRevenueRow>[] = useMemo(
    () => [
      {
        header: 'Vendor',
        accessorKey: 'vendorName',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-foreground">{row.original.vendorName}</p>
            <p className="text-[11px] text-muted-foreground">{row.original.vendorPhone}</p>
          </div>
        ),
      },
      {
        header: 'Shops',
        accessorKey: 'shopCount',
        cell: ({ getValue }) => <span className="text-sm tabular-nums">{getValue<number>()}</span>,
      },
      {
        header: 'Bookings',
        accessorKey: 'bookingCount',
        cell: ({ getValue }) => (
          <span className="text-sm font-medium tabular-nums">
            {getValue<number>().toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        header: 'Revenue',
        accessorKey: 'revenue',
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold text-emerald-600 tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.vendors || [],
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

  const handlePeriodChange = (value: FinancePeriod) => {
    setFilter((prev) => ({ ...prev, period: value, page: 1, from: undefined, to: undefined }));
  };

  const handleSortToggle = () => {
    setFilter((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>, key: 'from' | 'to') => {
    setFilter((prev) => ({ ...prev, [key]: e.target.value || undefined, page: 1 }));
  };

  const SortIcon =
    filter.sortOrder === 'asc' ? ArrowUp : filter.sortOrder === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Vendors */}
        <div className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">My Vendors</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Store className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {summaryLoading ? '—' : (summary?.vendorCount ?? 0)}
            </p>
          </div>
        </div>

        {/* Today */}
        <div className="flex flex-col gap-2 rounded-xl border border-emerald-100 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {summaryLoading ? '—' : formatCurrency(summary?.today.revenue ?? 0)}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {summaryLoading
                ? ''
                : `${(summary?.today.bookingCount ?? 0).toLocaleString('en-IN')} bookings`}
            </p>
          </div>
        </div>

        {/* This Week */}
        <div className="flex flex-col gap-2 rounded-xl border border-violet-100 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">This Week</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Calendar className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {summaryLoading ? '—' : formatCurrency(summary?.thisWeek.revenue ?? 0)}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {summaryLoading
                ? ''
                : `${(summary?.thisWeek.bookingCount ?? 0).toLocaleString('en-IN')} bookings`}
            </p>
          </div>
        </div>

        {/* This Month */}
        <div className="flex flex-col gap-2 rounded-xl border border-amber-100 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">This Month</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <CalendarDays className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {summaryLoading ? '—' : formatCurrency(summary?.thisMonth.revenue ?? 0)}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {summaryLoading
                ? ''
                : `${(summary?.thisMonth.bookingCount ?? 0).toLocaleString('en-IN')} bookings`}
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="flex flex-col gap-2 rounded-xl border border-rose-100 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Total</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
              <Wallet className="h-4 w-4 text-rose-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {summaryLoading ? '—' : formatCurrency(summary?.total.revenue ?? 0)}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {summaryLoading
                ? ''
                : `${(summary?.total.bookingCount ?? 0).toLocaleString('en-IN')} bookings`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <Input
          placeholder="Search vendor name / phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-[220px] text-sm border-border/60 bg-muted/30"
        />

        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={
                filter.period === p.value
                  ? 'rounded-md bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm border border-border/60 transition-all'
                  : 'rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors'
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {filter.period === 'custom' && (
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
        )}

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 border-border/60"
            onClick={handleSortToggle}
          >
            <SortIcon className="h-4 w-4" />
            Revenue {filter.sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
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
                    Failed to load vendor revenue data. Please try refreshing.
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
                    No vendor revenue data found for the selected filters.
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
            of <span className="font-medium text-foreground">{data?.total ?? 0}</span> vendors
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
