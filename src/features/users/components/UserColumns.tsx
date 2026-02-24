'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Ban, Eye, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserListItem } from '../types';
import Link from 'next/link';
import { format } from 'date-fns';

interface UserColumnsProps {
  onBlock: (user: UserListItem) => void;
  onUnblock: (user: UserListItem) => void;
}

export const createUserColumns = ({
  onBlock,
  onUnblock,
}: UserColumnsProps): ColumnDef<UserListItem>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const { name, phone, email } = row.original;
      return (
        <div className="flex flex-col space-y-1">
          <span className="font-medium text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground font-mono">{phone}</span>
          {email && <span className="text-[10px] text-muted-foreground/80">{email}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === 'ACTIVE' ? 'default' : status === 'BLOCKED' ? 'destructive' : 'secondary'
          }
          className={
            status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none'
              : status === 'BLOCKED'
                ? 'bg-red-100 text-red-800 hover:bg-red-100 border-none'
                : ''
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'walletBalance',
    header: 'Wallet',
    cell: ({ row }) => {
      return (
        <span className="font-mono text-sm font-medium">
          ₹{row.original.walletBalance.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: 'cancellationCount',
    header: 'Cancellations',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono bg-amber-50 text-amber-900 border-amber-200">
        {row.original.cancellationCount}
      </Badge>
    ),
  },
  {
    accessorKey: 'registeredAt',
    header: 'Registered',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.original.registeredAt), 'dd MMM yyyy')}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const isBlocked = user.status === 'BLOCKED';
      const isDeleted = user.status === 'DELETED';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/users/${user.id}`} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                View details
              </Link>
            </DropdownMenuItem>

            {!isDeleted && (
              <>
                <DropdownMenuSeparator />
                {isBlocked ? (
                  <DropdownMenuItem
                    onClick={() => onUnblock(user)}
                    className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Unblock User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onBlock(user)}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Block User
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
