'use client';

import * as React from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, Users, CheckCircle2, Ban } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUsers, useBlockUser, useUnblockUser } from '@/features/users/hooks';
import { createUserColumns } from './UserColumns';
import { useMounted } from '@/hooks/use-mounted';
import { useDebounce } from '@/hooks/useDebounce';
import { ListUsersFilter, UserListItem } from '../types';

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

export function UserTable() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = React.useState('');
  const debouncedSearch = useDebounce(searchValue, 500);

  const [filter, setFilter] = React.useState<ListUsersFilter>({ page: 1, limit: 10 });

  const [blockUserModal, setBlockUserModal] = React.useState<{
    isOpen: boolean;
    user: UserListItem | null;
  }>({
    isOpen: false,
    user: null,
  });
  const [blockReason, setBlockReason] = React.useState('');

  const [unblockUserModal, setUnblockUserModal] = React.useState<{
    isOpen: boolean;
    user: UserListItem | null;
  }>({
    isOpen: false,
    user: null,
  });

  const blockMutation = useBlockUser(blockUserModal.user?.id || '');
  const unblockMutation = useUnblockUser(unblockUserModal.user?.id || '');

  React.useEffect(() => {
    setFilter((prev) => ({ ...prev, page: pagination.pageIndex + 1, limit: pagination.pageSize }));
  }, [pagination]);

  React.useEffect(() => {
    setFilter((prev) => ({ ...prev, search: debouncedSearch || undefined, page: 1 }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useUsers(filter);
  const mounted = useMounted();

  const handleBlockAction = () => {
    if (!blockUserModal.user || !blockReason.trim()) return;
    blockMutation.mutate(blockReason.trim(), {
      onSuccess: () => {
        setBlockUserModal({ isOpen: false, user: null });
        setBlockReason('');
      },
    });
  };

  const handleUnblockAction = () => {
    if (!unblockUserModal.user) return;
    unblockMutation.mutate(undefined, {
      onSuccess: () => {
        setUnblockUserModal({ isOpen: false, user: null });
      },
    });
  };

  const columns = React.useMemo(
    () =>
      createUserColumns({
        onBlock: (user) => setBlockUserModal({ isOpen: true, user }),
        onUnblock: (user) => setUnblockUserModal({ isOpen: true, user }),
      }),
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

  if (!mounted) return null;

  // Summary stats
  const counts = data?.counts;

  const stats = [
    {
      label: 'Total Users',
      value: counts?.total ?? data?.total ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active',
      value: counts?.active ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Blocked',
      value: counts?.blocked ?? 0,
      icon: Ban,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8 h-8 text-sm border-border/60 bg-muted/30 focus-visible:bg-background"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <Select
          value={filter.status || 'ALL'}
          onValueChange={(value) => {
            const newStatus = value === 'ALL' ? undefined : (value as 'ACTIVE' | 'BLOCKED');
            setFilter((prev) => ({ ...prev, status: newStatus, page: 1 }));
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs border-border/60 bg-muted/30">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ALL" className="text-xs">
              All Users
            </SelectItem>
            <SelectItem value="ACTIVE" className="text-xs">
              Active
            </SelectItem>
            <SelectItem value="BLOCKED" className="text-xs">
              Blocked
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/40">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
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
                      <p className="font-medium">Failed to load users</p>
                      <p className="text-xs text-red-400">Please try refreshing the page</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
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
                    No users found matching your filters.
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
            of <span className="font-medium text-foreground">{data?.total ?? 0}</span> users
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

      {/* Block User Modal */}
      <Dialog
        open={blockUserModal.isOpen}
        onOpenChange={(isOpen) => !isOpen && setBlockUserModal({ isOpen: false, user: null })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              Are you sure you want to block {blockUserModal.user?.name}? This will prevent them
              from accessing the app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Reason for blocking (required)..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="h-24 resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockUserModal({ isOpen: false, user: null })}
              disabled={blockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockAction}
              disabled={!blockReason.trim() || blockMutation.isPending}
            >
              {blockMutation.isPending ? 'Blocking...' : 'Confirm Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock User Modal */}
      <Dialog
        open={unblockUserModal.isOpen}
        onOpenChange={(isOpen) => !isOpen && setUnblockUserModal({ isOpen: false, user: null })}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Unblock User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unblock {unblockUserModal.user?.name}? They will regain full
              access to the app.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setUnblockUserModal({ isOpen: false, user: null })}
              disabled={unblockMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnblockAction}
              disabled={unblockMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {unblockMutation.isPending ? 'Unblocking...' : 'Confirm Unblock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
