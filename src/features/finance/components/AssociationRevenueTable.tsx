'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { Store, TrendingUp } from 'lucide-react';

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
import { useAssociationRevenue } from '../hooks';
import { AssociationRevenueItem, AssociationRevenueFilter } from '../types';
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

const columns: ColumnDef<AssociationRevenueItem>[] = [
  {
    header: '#',
    id: 'index',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">{row.index + 1}</span>
    ),
  },
  {
    header: 'Shop',
    accessorKey: 'shopName',
    cell: ({ getValue, row }) => (
      <div>
        <p className="text-sm font-medium">{getValue<string>()}</p>
        <p className="text-xs text-muted-foreground">{row.original.vendorName}</p>
      </div>
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
    header: 'Revenue',
    accessorKey: 'revenue',
    cell: ({ getValue }) => (
      <span className="text-sm font-semibold text-emerald-600">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
];

export function AssociationRevenueTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<AssociationRevenueFilter>({ page: 1, limit: 10 });

  useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  const { data, isLoading, isError } = useAssociationRevenue(filter);
  const mounted = useMounted();
  const cols = useMemo(() => columns, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.vendors || [],
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>, type: 'startDate' | 'endDate') => {
    setFilter((prev) => ({ ...prev, [type]: e.target.value || undefined, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-card p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <Store className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">My Vendors</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {isLoading ? '—' : (data?.total ?? 0)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-card p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {isLoading ? '—' : formatCurrency(data?.totalRevenue ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
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
                    Failed to load revenue data. Please try refreshing.
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
                    No vendor revenue data found.
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
