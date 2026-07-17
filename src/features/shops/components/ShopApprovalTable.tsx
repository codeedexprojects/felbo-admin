'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Store, Ban } from 'lucide-react';

import { TablePagination } from '@/components/ui/table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePendingShops } from '@/features/shops/hooks';
import { createShopApprovalColumns } from './ShopApprovalColumns';
import { useMounted } from '@/hooks/use-mounted';
import { PendingShopsFilter } from '../types';

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

export function ShopApprovalTable() {
  'use no memo';

  const router = useRouter();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<PendingShopsFilter>({ page: 1, limit: 10 });
  const columns = useMemo(() => createShopApprovalColumns(), []);

  useEffect(() => {
    setFilter({ page: pagination.pageIndex + 1, limit: pagination.pageSize });
  }, [pagination]);

  const { data, isLoading, isError } = usePendingShops(filter);
  const mounted = useMounted();

  const table = useReactTable({
    data: data?.shops || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  if (!mounted) return null;

  return (
    <div className="space-y-5">
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
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Ban className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Failed to load pending shops.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => router.push(`/dashboard/shops/approval/${row.original.id}`)}
                  className="cursor-pointer border-border/40 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3 text-sm"
                      onClick={
                        cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Store className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">No pending shops</p>
                    <p className="text-xs">All caught up - no shops awaiting approval</p>
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
          {(data?.total ?? 0) > 0 ? `${data?.total} pending shop(s)` : 'No pending shops'}
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
