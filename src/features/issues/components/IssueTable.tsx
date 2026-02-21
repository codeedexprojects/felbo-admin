'use client';

import * as React from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { AlertOctagon, Ban, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useIssues } from '@/features/issues/hooks';
import { issueColumns } from './IssueColumns';
import { useMounted } from '@/hooks/use-mounted';
import { IssueListFilter, IssueStatus, IssueType } from '../types';

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

export function IssueTable() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = React.useState<IssueListFilter>({ page: 1, limit: 10 });

  React.useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  const { data, isLoading, isError } = useIssues(filter);
  const mounted = useMounted();

  const table = useReactTable({
    data: data?.issues || [],
    columns: issueColumns,
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
      label: 'Total Issues',
      value: counts?.total ?? data?.total ?? 0,
      icon: AlertOctagon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Open',
      value: counts?.open ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Resolved',
      value: counts?.resolved ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Rejected',
      value: counts?.rejected ?? 0,
      icon: Ban,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ];

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
        <Select
          value={filter.status || 'ALL'}
          onValueChange={(value) => {
            setFilter((prev) => ({
              ...prev,
              status: value === 'ALL' ? undefined : (value as IssueStatus),
              page: 1,
            }));
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="h-8 w-[140px] text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.type || 'ALL'}
          onValueChange={(value) => {
            setFilter((prev) => ({
              ...prev,
              type: value === 'ALL' ? undefined : (value as IssueType),
              page: 1,
            }));
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="h-8 w-[200px] text-sm border-border/60 bg-muted/30">
            <SelectValue placeholder="Issue Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="SHOP_CLOSED">Shop Closed</SelectItem>
            <SelectItem value="BARBER_UNAVAILABLE">Barber Unavailable</SelectItem>
            <SelectItem value="SERVICE_NOT_PROVIDED">Service Not Provided</SelectItem>
            <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
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
                <SkeletonRow key={i} cols={issueColumns.length} />
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={issueColumns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Ban className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Failed to load issues.</p>
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
                <TableCell colSpan={issueColumns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 opacity-30 text-emerald-500" />
                    <p className="text-sm font-medium">No issues found</p>
                    <p className="text-xs">Try adjusting your filters</p>
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
          {(counts?.total ?? data?.total ?? 0) > 0 && ` · ${counts?.total ?? data?.total} issues`}
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
