'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, CalendarDays, CheckCircle2, Ban, Calendar } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookings } from '../hooks';
import { createBookingColumns } from './BookingColumns';
import { useMounted } from '@/hooks/use-mounted';
import { useDebounce } from '@/hooks/useDebounce';
import { ListBookingsFilter } from '../types';

import { useAuthStore } from '@/stores/authStore';

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

export function BookingsTable() {
  const { admin } = useAuthStore();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 500);

  const [filter, setFilter] = useState<ListBookingsFilter>({
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

  const { data, isLoading, isError } = useBookings(filter);
  const mounted = useMounted();

  const columns = useMemo(() => createBookingColumns(admin?.role), [admin?.role]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.bookings || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  const stats = [
    {
      label: 'Total Bookings',
      value: data?.total ?? 0,
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Confirmed',
      value: 0, // Not supported by backend yet
      icon: Calendar,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: 'Completed',
      value: 0, // Not supported by backend yet
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Cancelled',
      value: 0, // Not supported by backend yet
      icon: Ban,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ];

  const handleStatusChange = (value: string) => {
    const newStatus = value === 'ALL' ? undefined : value;
    setFilter((prev) => ({ ...prev, status: newStatus, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>, type: 'startDate' | 'endDate') => {
    const val = e.target.value || undefined;
    setFilter((prev) => ({ ...prev, [type]: val, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-9 h-10 text-sm border-border/60 bg-muted/30 focus-visible:bg-background"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <Select value={filter.status || 'ALL'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px] h-10 text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ALL" className="text-sm">
              All Status
            </SelectItem>
            <SelectItem value="CONFIRMED" className="text-sm">
              Confirmed
            </SelectItem>
            <SelectItem value="COMPLETED" className="text-sm">
              Completed
            </SelectItem>
            <SelectItem value="CANCELLED_BY_USER" className="text-sm">
              Cancelled (User)
            </SelectItem>
            <SelectItem value="CANCELLED_BY_VENDOR" className="text-sm">
              Cancelled (Vendor)
            </SelectItem>
            <SelectItem value="NO_SHOW" className="text-sm">
              No Show
            </SelectItem>
            <SelectItem value="PENDING_PAYMENT" className="text-sm">
              Pending Payment
            </SelectItem>
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
          <span className="text-sm text-muted-foreground">-</span>
          <Input
            type="date"
            className="h-10 text-sm w-[140px] border-border/60 bg-muted/30"
            value={filter.endDate || ''}
            onChange={(e) => handleDateChange(e, 'endDate')}
            title="End Date"
          />
        </div>
      </div>

      {/* Main Table Card */}
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
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <p className="font-medium">Failed to load bookings</p>
                      <p className="text-xs text-red-400">Please try refreshing the page</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group border-border/40 hover:bg-muted/30 transition-colors"
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
                    No bookings found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            Showing
            <span className="font-medium text-foreground">
              {data?.total === 0
                ? 0
                : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
            to
            <span className="font-medium text-foreground">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data?.total ?? 0
              )}
            </span>
            of <span className="font-medium text-foreground">{data?.total ?? 0}</span> bookings
          </div>
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
