'use client';

import React, { useState, useEffect } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, Users, CheckCircle2, Clock, Ban } from 'lucide-react';

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

import { useVerificationRequests } from '@/features/vendors/hooks';
import { verificationColumns } from './VerificationColumns';
import { useMounted } from '@/hooks/use-mounted';
import { useDebounce } from '@/hooks/useDebounce';
import { VerificationRequestsFilter } from '@/features/vendors/types';

// Skeleton row component
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

export function VendorVerificationTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 500);

  // Always fetches PENDING — filter is baked into the dedicated endpoint
  const [filter, setFilter] = useState<VerificationRequestsFilter>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  useEffect(() => {
    setFilter((prev) => ({ ...prev, search: debouncedSearch || undefined, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useVerificationRequests(filter);
  const mounted = useMounted();

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.vendors || [],
    columns: verificationColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  // Stats — sourced from server-side counts (accurate across all pages)
  const counts = data?.counts;

  const stats = [
    {
      label: 'Pending Requests',
      value: counts?.pending ?? data?.total ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Association',
      value: counts?.association ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Independent',
      value: counts?.independent ?? 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold text-foreground">
                {isLoading ? '—' : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search request..."
            className="pl-8 h-8 text-sm border-border/60 bg-muted/30 focus-visible:bg-background"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border/60 bg-muted/30 hover:bg-muted/30"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={verificationColumns.length} />
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={verificationColumns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Ban className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Failed to load requests.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/40 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={verificationColumns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 opacity-30 text-emerald-500" />
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs">No pending verification requests found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Page {pagination.pageIndex + 1} of {data?.totalPages || 1}
          {(counts?.pending ?? data?.total ?? 0) > 0 &&
            ` · ${counts?.pending ?? data?.total} requests`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/60"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/60"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
