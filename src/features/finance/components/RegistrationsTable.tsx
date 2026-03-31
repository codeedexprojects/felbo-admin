'use client';

import { useState, useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { Calendar as CalendarIcon, X, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { format } from 'date-fns';
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
import { useRegistrations } from '../hooks';
import { IndependentRegistrationRowDto, IndependentRegistrationListParams } from '../types';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

function StatusBadge({ status }: { status: string }) {
  const isVerified = status === 'VERIFIED';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border',
        isVerified
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      )}
    >
      {isVerified ? 'Verified' : status}
    </span>
  );
}

export function RegistrationsTable() {
  const mounted = useMounted();
  const [filter, setFilter] = useState<IndependentRegistrationListParams>({ page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync debounced search with filter
  useMemo(() => {
    if (mounted) {
      setFilter((prev) => ({ ...prev, search: debouncedSearch || undefined, page: 1 }));
    }
  }, [debouncedSearch, mounted]);

  const { data, isLoading, isError } = useRegistrations(filter);

  const columns: ColumnDef<IndependentRegistrationRowDto>[] = useMemo(
    () => [
      {
        header: 'Vendor',
        accessorKey: 'vendorName',
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-foreground">{row.original.vendorName}</p>
            <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
              {row.original.vendorId}
            </p>
          </div>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'vendorPhone',
        cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'verificationStatus',
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
      {
        header: 'Registration Fee',
        accessorKey: 'registrationAmount',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-foreground">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        header: 'Net Revenue',
        accessorKey: 'netRevenue',
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold text-emerald-600 tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        header: 'Registered At',
        accessorKey: 'paidAt',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums">{formatDate(getValue<string>())}</span>
        ),
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.registrations || [],
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

  const handleDateChange = (date: Date | undefined, key: 'from' | 'to') => {
    const val = date ? format(date, 'yyyy-MM-dd') : undefined;
    setFilter((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendor..."
            type="search"
            className="w-[200px] h-9 bg-muted/30 pl-8 text-xs border-border/60 focus-visible:ring-1 focus-visible:ring-ring"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-9 w-[130px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !filter.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {filter.from ? format(new Date(filter.from), 'dd MMM yyyy') : 'From Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
                  'h-9 w-[130px] px-3 text-xs font-normal border-border/60 bg-muted/30 justify-start',
                  !filter.to && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {filter.to ? format(new Date(filter.to), 'dd MMM yyyy') : 'To Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDatePicker
                selected={filter.to ? new Date(filter.to) : undefined}
                onSelect={(date) => handleDateChange(date, 'to')}
              />
            </PopoverContent>
          </Popover>
        </div>

        {(filter.search || filter.from || filter.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput('');
              setFilter({ page: 1, limit: 10 });
            }}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
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
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-red-500">
                    Failed to load registration data. Please try refreshing.
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
                    No registrations found for the selected filters.
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
          {(data?.total ?? 0) > 0 ? `${data?.total} records` : 'No records'}
        </p>
        <TablePagination
          pageIndex={(filter.page ?? 1) - 1}
          totalPages={data?.totalPages || 1}
          onPageChange={(idx) => setFilter((prev) => ({ ...prev, page: idx + 1 }))}
        />
      </div>
    </div>
  );
}
