'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookingListItem } from '../types';

export const createBookingColumns = (): ColumnDef<BookingListItem>[] => [
  {
    accessorKey: 'bookingNumber',
    header: 'Booking ID',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.bookingNumber}</span>
    ),
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{row.original.user.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.user.phone}</span>
      </div>
    ),
  },
  {
    accessorKey: 'vendor',
    header: 'Shop',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.vendor.shopName}</span>
    ),
  },
  {
    accessorKey: 'datetime',
    header: 'Date & Time',
    cell: ({ row }) => {
      // safely parse date or just display string
      const dateStr = row.original.date;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {dateStr ? format(new Date(dateStr), 'MMM dd, yyyy') : 'N/A'}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.time}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">₹{row.original.totalAmount}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === 'COMPLETED'
              ? 'default'
              : status === 'CONFIRMED'
                ? 'secondary'
                : 'destructive'
          }
          className={`text-[10px] sm:text-xs ${status === 'COMPLETED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/bookings/${row.original.id}`} className="gap-2">
          <Eye className="h-4 w-4" />
          View
        </Link>
      </Button>
    ),
  },
];
