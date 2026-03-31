'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, CalendarDays, CheckCircle2, Ban, Calendar as CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/ui/table-pagination';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { useBookings, useAdminBookingStats } from '../hooks';
import { createBookingColumns } from './BookingColumns';
import { useMounted } from '@/hooks/use-mounted';
import { useDebounce } from '@/hooks/useDebounce';
import { ListBookingsFilter, BookingStatsPeriod } from '../types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const [period, setPeriod] = useState<BookingStatsPeriod>('day');
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

  useEffect(() => {
    if (filter.startDate || filter.endDate) {
      setPeriod('custom');
    } else if (period === 'custom') {
      setPeriod('day');
    }
  }, [filter.startDate, filter.endDate, period]);

  const { data, isLoading, isError } = useBookings(filter);
  const { data: bookingStats, isLoading: isStatsLoading } = useAdminBookingStats({
    period:
      filter.startDate && filter.endDate && period === 'custom'
        ? 'custom'
        : period === 'custom'
          ? 'custom'
          : period,
    startDate:
      period === 'custom' || (filter.startDate && filter.endDate) ? filter.startDate : undefined,
    endDate:
      period === 'custom' || (filter.startDate && filter.endDate) ? filter.endDate : undefined,
  });
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
      value: bookingStats?.total ?? 0,
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Confirmed',
      value: bookingStats?.confirmed ?? 0,
      icon: CalendarIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: 'Completed',
      value: bookingStats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Cancelled',
      value: bookingStats?.cancelled ?? 0,
      icon: Ban,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
    {
      label: 'No Shows',
      value: bookingStats?.noShow ?? 0,
      icon: Ban,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const handleStatusChange = (value: string) => {
    const newStatus = value === 'ALL' ? undefined : value;
    setFilter((prev) => ({ ...prev, status: newStatus, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleDateChange = (date: Date | undefined, type: 'startDate' | 'endDate') => {
    const val = date ? format(date, 'yyyy-MM-dd') : undefined;
    setFilter((prev) => ({ ...prev, [type]: val, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const isFiltered = !!(searchValue || filter.status || filter.startDate || filter.endDate);

  const handleClearFilters = () => {
    setSearchValue('');
    setFilter({ page: 1, limit: 10 });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-5">
      {/* Stat Header & Period Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Booking Analytics</h2>
          {bookingStats && (
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              Showing data from{' '}
              <span className="text-foreground">
                {format(new Date(bookingStats.startDate), 'dd MMM')}
              </span>{' '}
              to{' '}
              <span className="text-foreground">
                {format(new Date(bookingStats.endDate), 'dd MMM yyyy')}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border/50 bg-muted/20 p-1 backdrop-blur-sm">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => {
                setPeriod(p);
              }}
              className={cn(
                'h-7 px-4 text-[11px] font-bold capitalize transition-all rounded-lg',
                period === p
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border/20'
                  : 'text-muted-foreground hover:bg-muted/40'
              )}
            >
              {p}
            </Button>
          ))}
          {period === 'custom' && (
            <div className="h-7 px-4 flex items-center text-[11px] font-bold capitalize bg-primary/10 text-primary border border-primary/20 rounded-lg shadow-sm">
              Custom Range
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                {isStatsLoading ? '—' : stat.value}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-10 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !filter.startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {filter.startDate
                  ? format(new Date(filter.startDate), 'dd MMM yyyy')
                  : 'Start Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker
                selected={filter.startDate ? new Date(filter.startDate) : undefined}
                onSelect={(date) => handleDateChange(date, 'startDate')}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">-</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-10 w-[140px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !filter.endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {filter.endDate ? format(new Date(filter.endDate), 'dd MMM yyyy') : 'End Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker
                selected={filter.endDate ? new Date(filter.endDate) : undefined}
                onSelect={(date) => handleDateChange(date, 'endDate')}
              />
            </PopoverContent>
          </Popover>
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-10 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {(data?.total ?? 0) > 0 ? `${data?.total} bookings` : 'No bookings'}
        </p>
        <TablePagination
          pageIndex={pagination.pageIndex}
          totalPages={data?.totalPages || 1}
          onPageChange={(idx) => setPagination((prev) => ({ ...prev, pageIndex: idx }))}
        />
      </div>
    </div>
  );
}
