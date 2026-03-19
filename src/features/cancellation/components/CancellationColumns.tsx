'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CancellationListItem } from '../types';

export const cancellationColumns: ColumnDef<CancellationListItem>[] = [
  {
    accessorKey: 'bookingNumber',
    header: 'Booking ID',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.bookingNumber}</span>
    ),
  },
  {
    accessorKey: 'userPhone',
    header: 'User Phone',
    cell: ({ row }) => <span className="text-foreground">{row.original.userPhone ?? '—'}</span>,
  },
  {
    accessorKey: 'shopName',
    header: 'Shop',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.shopName}</span>,
  },
  {
    accessorKey: 'datetime',
    header: 'Date & Time',
    cell: ({ row }) => {
      const dateStr = row.original.date;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {dateStr ? format(new Date(dateStr), 'MMM dd, yyyy') : 'N/A'}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.startTime}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'cancelledBy',
    header: 'Cancelled By',
    cell: ({ row }) => (
      <Badge
        variant={row.original.cancelledBy === 'USER' ? 'secondary' : 'outline'}
        className="text-[10px] uppercase"
      >
        {row.original.cancelledBy}
      </Badge>
    ),
  },
  {
    accessorKey: 'refundStatus',
    header: 'Refund Status',
    cell: ({ row }) => {
      const status = row.original.refundStatus;
      return (
        <Badge
          variant={status === 'PROCESSED' ? 'default' : 'destructive'}
          className={`text-[10px] ${status === 'PROCESSED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'advancePaid',
    header: 'Advance Paid',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">₹{row.original.advancePaid}</span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/cancellation-management/${row.original.id}`} className="gap-2">
          <Eye className="h-4 w-4" />
          View
        </Link>
      </Button>
    ),
  },
];
