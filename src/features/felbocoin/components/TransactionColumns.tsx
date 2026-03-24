'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AdminTransaction, CoinTransactionDirection, CoinTransactionType } from '../types';

const TYPE_LABELS: Record<CoinTransactionType, string> = {
  COIN_EARNED: 'Earned',
  COIN_REDEEMED: 'Redeemed',
  COIN_REFUND: 'Refund',
  COIN_REVERSAL: 'Reversal',
  ADMIN_CREDIT: 'Admin Credit',
  ADMIN_DEBIT: 'Admin Debit',
};

const TYPE_STYLES: Record<CoinTransactionType, string> = {
  COIN_EARNED: 'bg-emerald-100 text-emerald-800',
  COIN_REDEEMED: 'bg-amber-100 text-amber-800',
  COIN_REFUND: 'bg-blue-100 text-blue-800',
  COIN_REVERSAL: 'bg-purple-100 text-purple-800',
  ADMIN_CREDIT: 'bg-teal-100 text-teal-800',
  ADMIN_DEBIT: 'bg-rose-100 text-rose-800',
};

const DIR_STYLES: Record<CoinTransactionDirection, string> = {
  CREDIT: 'bg-emerald-100 text-emerald-700',
  DEBIT: 'bg-red-100 text-red-700',
};

export const transactionColumns: ColumnDef<AdminTransaction>[] = [
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
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant="outline" className={`border-none text-xs font-medium ${TYPE_STYLES[type]}`}>
          {TYPE_LABELS[type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'direction',
    header: 'Direction',
    cell: ({ row }) => {
      const dir = row.original.direction;
      return (
        <Badge variant="outline" className={`border-none text-xs font-semibold ${DIR_STYLES[dir]}`}>
          {dir === 'CREDIT' ? '+ Credit' : '− Debit'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'coins',
    header: 'Coins',
    cell: ({ row }) => {
      const { coins, direction } = row.original;
      return (
        <span
          className={`font-mono font-semibold text-sm ${direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {direction === 'CREDIT' ? '+' : '−'}
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
    accessorKey: 'bookingNumber',
    header: 'Booking #',
    cell: ({ row }) => {
      const bn = row.original.bookingNumber;
      return bn ? (
        <span className="font-mono text-xs text-muted-foreground">{bn}</span>
      ) : (
        <span className="text-muted-foreground/40 text-xs">—</span>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
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
