'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Coins } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface LeaderboardColumnsProps {
  onCredit: (user: LeaderboardUser) => void;
  onDebit: (user: LeaderboardUser) => void;
}

export const createLeaderboardColumns = ({
  onCredit,
  onDebit,
}: LeaderboardColumnsProps): ColumnDef<LeaderboardUser>[] => [
  {
    id: 'rank',
    header: 'Rank',
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-muted-foreground w-6 text-center block">
        #{row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      const { name, phone, email } = row.original;
      return (
        <div className="flex flex-col space-y-0.5">
          <span className="font-medium text-foreground text-sm">{name}</span>
          <span className="text-xs text-muted-foreground font-mono">{phone}</span>
          {email && <span className="text-[10px] text-muted-foreground/70">{email}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'felboCoinBalance',
    header: 'Coin Balance',
    cell: ({ row }) => {
      const balance = row.original.felboCoinBalance;
      return (
        <div className="flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-mono font-semibold text-sm text-foreground">
            {balance.toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            onClick={() => onCredit(user)}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Credit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => onDebit(user)}
          >
            <MinusCircle className="h-3.5 w-3.5" />
            Debit
          </Button>
        </div>
      );
    },
  },
];
