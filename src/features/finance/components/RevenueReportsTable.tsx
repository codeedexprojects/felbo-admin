'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useRevenueReports } from '../hooks';
import { useVendors } from '@/features/vendors/hooks';
import { RevenueReportItem, RevenueReportsFilter } from '../types';
import { useMounted } from '@/hooks/use-mounted';

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

const columns: ColumnDef<RevenueReportItem>[] = [
  {
    header: 'Date',
    accessorKey: 'date',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium">
        {new Date(getValue<string>()).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    header: 'Vendor',
    accessorKey: 'vendorName',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue<string>() || '—'}</span>
    ),
  },
  {
    header: 'Bookings',
    accessorKey: 'bookings',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium tabular-nums">{getValue<number>()}</span>
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
];

function exportToCSV(reports: RevenueReportItem[]) {
  const headers = ['Date', 'Vendor', 'Bookings', 'Amount'];
  const rows = reports.map((r) => [r.date, r.vendorName || '', r.bookings, r.amount]);
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function RevenueReportsTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<RevenueReportsFilter>({ page: 1, limit: 10 });

  useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  const { data, isLoading, isError } = useRevenueReports(filter);
  const vendorsQuery = useVendors({ page: 1, limit: 100 });
  const vendors = vendorsQuery.data?.vendors || [];
  const mounted = useMounted();

  const cols = useMemo(() => columns, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.reports || [],
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  const handleVendorChange = (value: string) => {
    setFilter((prev) => ({
      ...prev,
      vendorId: value === 'ALL' ? undefined : value,
      page: 1,
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>, type: 'startDate' | 'endDate') => {
    setFilter((prev) => ({ ...prev, [type]: e.target.value || undefined, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <Select
          value={filter.vendorId || 'ALL'}
          onValueChange={handleVendorChange}
          disabled={vendorsQuery.isLoading}
        >
          <SelectTrigger className="w-[180px] h-10 text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="All Vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-sm">
              All Vendors
            </SelectItem>
            {vendors.map((v) => (
              <SelectItem key={v.id} value={v.id} className="text-sm">
                {v.ownerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="h-10 text-sm w-[140px] border-border/60 bg-muted/30"
            value={filter.startDate || ''}
            onChange={(e) => handleDateChange(e, 'startDate')}
            title="Start Date"
          />
          <span className="text-sm text-muted-foreground">–</span>
          <Input
            type="date"
            className="h-10 text-sm w-[140px] border-border/60 bg-muted/30"
            value={filter.endDate || ''}
            onChange={(e) => handleDateChange(e, 'endDate')}
            title="End Date"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {data && (
            <span className="text-sm text-muted-foreground">
              Total:{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(data.totalAmount)}
              </span>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 border-border/60"
            onClick={() => data && exportToCSV(data.reports)}
            disabled={!data?.reports.length}
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
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={cols.length} className="h-32 text-center text-red-500">
                    Failed to load revenue reports. Please try refreshing.
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
                    No revenue reports found for the selected filters.
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
            of <span className="font-medium text-foreground">{data?.total ?? 0}</span> records
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
