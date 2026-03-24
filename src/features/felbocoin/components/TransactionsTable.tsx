'use client';

import { useEffect, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, X, Calendar } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

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
import { cn } from '@/lib/utils';

import { useTransactions } from '../hooks';
import { transactionColumns } from './TransactionColumns';
import { useDebounce } from '@/hooks/useDebounce';
import { TransactionsFilter, CoinTransactionType, CoinTransactionDirection } from '../types';

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

const TRANSACTION_TYPES: { label: string; value: CoinTransactionType }[] = [
  { label: 'Earned', value: 'COIN_EARNED' },
  { label: 'Redeemed', value: 'COIN_REDEEMED' },
  { label: 'Refund', value: 'COIN_REFUND' },
  { label: 'Reversal', value: 'COIN_REVERSAL' },
  { label: 'Admin Credit', value: 'ADMIN_CREDIT' },
  { label: 'Admin Debit', value: 'ADMIN_DEBIT' },
];

export function TransactionsTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [type, setType] = useState<CoinTransactionType | undefined>();
  const [direction, setDirection] = useState<CoinTransactionDirection | undefined>();
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const [filter, setFilter] = useState<TransactionsFilter>({ page: 1, limit: 20 });

  useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
      page: 1,
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useTransactions(filter);

  const handleTypeChange = (value: string) => {
    const newType = value === 'ALL' ? undefined : (value as CoinTransactionType);
    setType(newType);
    setFilter((prev) => ({ ...prev, type: newType, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleDirectionChange = (value: string) => {
    const newDir = value === 'ALL' ? undefined : (value as CoinTransactionDirection);
    setDirection(newDir);
    setFilter((prev) => ({ ...prev, direction: newDir, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleFromDate = (date: Date | undefined) => {
    setFromDate(date);
    setFilter((prev) => ({
      ...prev,
      from: date ? startOfDay(date).toISOString() : undefined,
      page: 1,
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleToDate = (date: Date | undefined) => {
    setToDate(date);
    setFilter((prev) => ({
      ...prev,
      to: date ? endOfDay(date).toISOString() : undefined,
      page: 1,
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const isFiltered = !!(search || type || direction || fromDate || toDate);

  const handleClearFilters = () => {
    setSearch('');
    setType(undefined);
    setDirection(undefined);
    setFromDate(undefined);
    setToDate(undefined);
    setFilter({ page: 1, limit: 20 });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const table = useReactTable({
    data: data?.transactions || [],
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-8 h-8 text-sm border-border/60 bg-muted/30 focus-visible:bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={type || 'ALL'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[150px] h-8 text-xs border-border/60 bg-muted/30">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">
              All Types
            </SelectItem>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-xs">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={direction || 'ALL'} onValueChange={handleDirectionChange}>
          <SelectTrigger className="w-[130px] h-8 text-xs border-border/60 bg-muted/30">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">
              All Directions
            </SelectItem>
            <SelectItem value="CREDIT" className="text-xs">
              Credit
            </SelectItem>
            <SelectItem value="DEBIT" className="text-xs">
              Debit
            </SelectItem>
          </SelectContent>
        </Select>

        {/* From date */}
        <div className="flex items-center gap-0.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-8 px-3 text-xs font-normal border-border/60 bg-muted/30 gap-1.5',
                  !fromDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {fromDate ? format(fromDate, 'dd MMM yyyy') : 'From'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker selected={fromDate} onSelect={handleFromDate} />
            </PopoverContent>
          </Popover>
          {fromDate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => handleFromDate(undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* To date */}
        <div className="flex items-center gap-0.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-8 px-3 text-xs font-normal border-border/60 bg-muted/30 gap-1.5',
                  !toDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {toDate ? format(toDate, 'dd MMM yyyy') : 'To'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker selected={toDate} onSelect={handleToDate} />
            </PopoverContent>
          </Popover>
          {toDate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => handleToDate(undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
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
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} cols={transactionColumns.length} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={transactionColumns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <p className="font-medium">Failed to load transactions</p>
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
                    colSpan={transactionColumns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No transactions found matching your filters.
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
          {(data?.total ?? 0) > 0
            ? `${data?.total.toLocaleString()} transactions`
            : 'No transactions'}
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
