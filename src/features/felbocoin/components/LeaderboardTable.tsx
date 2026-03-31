'use client';

import { useEffect, useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';

import { TablePagination } from '@/components/ui/table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useLeaderboard } from '../hooks';
import { createLeaderboardColumns } from './LeaderboardColumns';
import { CoinActionModal, CoinActionType } from './CoinActionModal';
import { LeaderboardUser } from '../types';

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

export function LeaderboardTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [page, setPage] = useState(1);
  const [modalType, setModalType] = useState<CoinActionType | null>(null);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    setPage(pagination.pageIndex + 1);
  }, [pagination]);

  const { data, isLoading, isError, refetch } = useLeaderboard(page, pagination.pageSize);

  const handleCredit = (user: LeaderboardUser) => {
    setSelectedUser(user);
    setModalType('credit');
  };

  const handleDebit = (user: LeaderboardUser) => {
    setSelectedUser(user);
    setModalType('debit');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    toast.success(
      modalType === 'credit'
        ? `Coins credited to ${selectedUser?.name}`
        : `Coins debited from ${selectedUser?.name}`
    );
    refetch();
  };

  const columns = useMemo(
    () => createLeaderboardColumns({ onCredit: handleCredit, onDebit: handleDebit }),

    []
  );

  const table = useReactTable({
    data: data?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  return (
    <div className="space-y-4">
      {/* Header note */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
        <Coins className="h-3.5 w-3.5 shrink-0" />
        Users are ranked by their current FelboCoin balance. Use Credit / Debit to manually adjust
        balances. You can also manage coins from any user&apos;s detail page.
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
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <p className="font-medium">Failed to load leaderboard</p>
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
                    No users found.
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
          {(data?.total ?? 0) > 0 ? `${data?.total.toLocaleString()} users` : 'No users'}
        </p>
        <TablePagination
          pageIndex={pagination.pageIndex}
          totalPages={data?.totalPages || 1}
          onPageChange={(idx) => setPagination((prev) => ({ ...prev, pageIndex: idx }))}
        />
      </div>

      {selectedUser && (
        <CoinActionModal
          type={modalType}
          userId={selectedUser.userId}
          userName={selectedUser.name}
          currentBalance={selectedUser.felboCoinBalance}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
