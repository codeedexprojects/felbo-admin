'use client';

import React, { useState, useEffect } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';

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
import { useCancellations } from '../hooks';
import { cancellationColumns } from './CancellationColumns';
import { useMounted } from '@/hooks/use-mounted';
import { useDebounce } from '@/hooks/useDebounce';
import { ListCancellationsFilter } from '../types';
import { format } from 'date-fns';
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

export function CancellationsTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 500);

  const [filter, setFilter] = useState<ListCancellationsFilter>({
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

  const { data, isLoading, isError } = useCancellations(filter);
  const mounted = useMounted();

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.cancellations || [],
    columns: cancellationColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  const handleCancelledByChange = (value: string) => {
    const newValue = value === 'ALL' ? undefined : (value as 'USER' | 'VENDOR');
    setFilter((prev) => ({ ...prev, cancelledBy: newValue, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleDateChange = (date: Date | undefined, type: 'startDate' | 'endDate') => {
    const val = date ? format(date, 'yyyy-MM-dd') : undefined;
    setFilter((prev) => ({ ...prev, [type]: val, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const isFiltered = !!(searchValue || filter.cancelledBy || filter.startDate || filter.endDate);

  const handleClearFilters = () => {
    setSearchValue('');
    setFilter({ page: 1, limit: 10 });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by booking ID, shop, phone..."
            className="pl-9 h-10 text-sm border-border/60 bg-muted/30 focus-visible:bg-background"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <Select value={filter.cancelledBy || 'ALL'} onValueChange={handleCancelledByChange}>
          <SelectTrigger className="w-[160px] h-10 text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="Cancelled By" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ALL" className="text-sm">
              All
            </SelectItem>
            <SelectItem value="USER" className="text-sm">
              By User
            </SelectItem>
            <SelectItem value="VENDOR" className="text-sm">
              By Vendor
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
                  <SkeletonRow key={i} cols={cancellationColumns.length} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={cancellationColumns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <p className="font-medium">Failed to load cancellations</p>
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
                    colSpan={cancellationColumns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No cancellations found matching your filters.
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
          {(data?.total ?? 0) > 0 ? `${data?.total} cancellations` : 'No cancellations'}
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
