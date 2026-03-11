'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookingListItem } from '../types';

export const createBookingColumns = (role?: string): ColumnDef<BookingListItem>[] => {
  const columns: ColumnDef<BookingListItem>[] = [
    {
      accessorKey: 'bookingNumber',
      header: 'Booking ID',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.bookingNumber}</span>
      ),
    },
    {
      accessorKey: 'shopName',
      header: 'Shop',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.shopName}</span>
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
            <span className="text-xs text-muted-foreground">
              {row.original.startTime} - {row.original.endTime}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">₹{row.original.totalServiceAmount}</span>
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

  if (role !== 'ASSOCIATION_ADMIN') {
    columns.splice(1, 0, {
      accessorKey: 'userPhone',
      header: 'User Phone',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.userPhone}</span>
      ),
    });
  }

  return columns;
};
