'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AdminLog } from '../types';

export const adminLogColumns: ColumnDef<AdminLog>[] = [
  {
    accessorKey: 'userName',
    header: 'User',
    cell: ({ row }) => {
      const { userName, userPhone } = row.original;
      return (
        <div className="flex flex-col space-y-0.5">
          <span className="font-medium text-foreground text-sm">{userName}</span>
          <span className="text-xs text-muted-foreground font-mono">{userPhone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'adminName',
    header: 'Admin',
    cell: ({ row }) => <span className="text-sm text-foreground">{row.original.adminName}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Action',
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge
          variant="outline"
          className={`border-none text-xs font-medium ${
            type === 'ADMIN_CREDIT' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {type === 'ADMIN_CREDIT' ? 'Credit' : 'Debit'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'coins',
    header: 'Coins',
    cell: ({ row }) => {
      const { coins, type } = row.original;
      return (
        <span
          className={`font-mono font-semibold text-sm ${
            type === 'ADMIN_CREDIT' ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {type === 'ADMIN_CREDIT' ? '+' : '−'}
          {coins.toLocaleString()}
        </span>
      );
    },
  },
  {
    id: 'balance',
    header: 'Balance',
    cell: ({ row }) => {
      const { balanceBefore, balanceAfter } = row.original;
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
          <span>{balanceBefore.toLocaleString()}</span>
          <span className="text-muted-foreground/50">→</span>
          <span className="font-medium text-foreground">{balanceAfter.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Reason',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground max-w-[220px] truncate block">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(row.original.createdAt), 'dd MMM yyyy, HH:mm')}
      </span>
    ),
  },
];
