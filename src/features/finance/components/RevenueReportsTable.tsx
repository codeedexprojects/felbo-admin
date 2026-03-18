'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { Download, ArrowUpDown, ArrowUp, ArrowDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useVendorRevenueTable } from '../hooks';
import { VendorRevenueRow, VendorRevenueTableFilter, FinancePeriod } from '../types';
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
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function RegTypeBadge({ type }: { type: VendorRevenueRow['registrationType'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        type === 'ASSOCIATION'
          ? 'bg-violet-50 text-violet-700 border border-violet-200'
          : 'bg-blue-50 text-blue-700 border border-blue-200'
      )}
    >
      {type === 'ASSOCIATION' ? 'Association' : 'Independent'}
    </span>
  );
}

function exportToCSV(vendors: VendorRevenueRow[]) {
  const headers = ['Vendor Name', 'Phone', 'Type', 'Shops', 'Bookings', 'Revenue'];
  const rows = vendors.map((v) => [
    v.vendorName,
    v.vendorPhone,
    v.registrationType,
    v.shopCount,
    v.bookingCount,
    v.revenue,
  ]);
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vendor-revenue-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const PERIOD_OPTIONS: { label: string; value: FinancePeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom', value: 'custom' },
];

export function RevenueReportsTable() {
  const [filter, setFilter] = useState<VendorRevenueTableFilter>({
    period: 'month',
    page: 1,
    limit: 10,
    sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setFilter((prev) => ({ ...prev, search: searchDebounced || undefined, page: 1 }));
  }, [searchDebounced]);

  const { data, isLoading, isError } = useVendorRevenueTable(filter);
  const mounted = useMounted();

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
        header: 'Type',
        accessorKey: 'registrationType',
        cell: ({ getValue }) => (
          <RegTypeBadge type={getValue<VendorRevenueRow['registrationType']>()} />
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

  const handleDateChange = (date: Date | undefined, key: 'from' | 'to') => {
    const val = date ? format(date, 'yyyy-MM-dd') : undefined;
    setFilter((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  const handleMinMax = (e: ChangeEvent<HTMLInputElement>, key: 'minRevenue' | 'maxRevenue') => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    setFilter((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  const SortIcon =
    filter.sortOrder === 'asc' ? ArrowUp : filter.sortOrder === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        {/* Search */}
        <Input
          placeholder="Search vendor name / phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-[220px] text-sm border-border/60 bg-muted/30"
        />

        {/* Period selector */}
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

        {/* Custom date pickers */}
        {filter.period === 'custom' && (
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
              <PopoverContent className="w-[320px] p-0" align="start">
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
              <PopoverContent className="w-[320px] p-0" align="start">
                <ModernDatePicker
                  selected={filter.to ? new Date(filter.to) : undefined}
                  onSelect={(date) => handleDateChange(date, 'to')}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Revenue range */}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder="Min ₹"
            className="h-10 w-[90px] text-sm border-border/60 bg-muted/30"
            onChange={(e) => handleMinMax(e, 'minRevenue')}
          />
          <Input
            type="number"
            placeholder="Max ₹"
            className="h-10 w-[90px] text-sm border-border/60 bg-muted/30"
            onChange={(e) => handleMinMax(e, 'maxRevenue')}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Sort toggle */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 border-border/60"
            onClick={handleSortToggle}
          >
            <SortIcon className="h-4 w-4" />
            Revenue {filter.sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 border-border/60"
            onClick={() => data && exportToCSV(data.vendors)}
            disabled={!data?.vendors.length}
          >
            <Download className="h-4 w-4" />
            Export CSV
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
