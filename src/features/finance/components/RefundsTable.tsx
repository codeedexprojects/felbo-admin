'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { RotateCcw, Wallet, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { useRefunds } from '../hooks';
import { RefundItem, RefundsFilter } from '../types';
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

function RefundTypeBadge({ type }: { type: RefundItem['type'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        type === 'WALLET' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
      )}
    >
      {type === 'WALLET' ? <Wallet className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
      {type === 'WALLET' ? 'To Wallet' : 'To Original'}
    </span>
  );
}

function RefundStatusBadge({ status }: { status: RefundItem['status'] }) {
  const styles = {
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    FAILED: 'bg-red-50 text-red-700',
  };
  const labels = { COMPLETED: 'Completed', PENDING: 'Pending', FAILED: 'Failed' };

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

const columns: ColumnDef<RefundItem>[] = [
  {
    header: 'Booking',
    accessorKey: 'bookingNumber',
    cell: ({ getValue }) => (
      <span className="text-sm font-mono font-medium">{getValue<string>()}</span>
    ),
  },
  {
    header: 'Customer',
    accessorKey: 'user',
    cell: ({ getValue }) => {
      const user = getValue<RefundItem['user']>();
      return (
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.phone}</p>
        </div>
      );
    },
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ getValue }) => (
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: ({ getValue }) => <RefundTypeBadge type={getValue<RefundItem['type']>()} />,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => <RefundStatusBadge status={getValue<RefundItem['status']>()} />,
  },
  {
    header: 'Reason',
    accessorKey: 'reason',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground max-w-[200px] line-clamp-2">
        {getValue<string>() || '—'}
      </span>
    ),
  },
  {
    header: 'Date',
    accessorKey: 'createdAt',
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
];

export function RefundsTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<RefundsFilter>({ page: 1, limit: 10 });

  useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  const { data, isLoading, isError } = useRefunds(filter);
  const mounted = useMounted();
  const cols = useMemo(() => columns, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.refunds || [],
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  const handleTypeChange = (value: string) => {
    setFilter((prev) => ({ ...prev, type: value === 'ALL' ? undefined : value, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

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
            label: 'Total Refunds',
            value: data?.total ?? 0,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
          },
          {
            label: 'Completed',
            value: '-',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
          },
          {
            label: 'Pending',
            value: '-',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm ${card.border}`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
              <RotateCcw className={`h-4 w-4 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold text-foreground">{isLoading ? '—' : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <Select value={filter.type || 'ALL'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[160px] h-10 text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-sm">
              All Types
            </SelectItem>
            <SelectItem value="WALLET" className="text-sm">
              To Wallet
            </SelectItem>
            <SelectItem value="ORIGINAL" className="text-sm">
              To Original
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter.status || 'ALL'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px] h-10 text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-sm">
              All Status
            </SelectItem>
            <SelectItem value="COMPLETED" className="text-sm">
              Completed
            </SelectItem>
            <SelectItem value="PENDING" className="text-sm">
              Pending
            </SelectItem>
            <SelectItem value="FAILED" className="text-sm">
              Failed
            </SelectItem>
          </SelectContent>
        </Select>
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
                    Failed to load refunds. Please try refreshing.
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
                    No refunds found matching your filters.
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
