'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PendingApprovalShopDto } from '@/features/shops/types';

function ShopTypePill({ type }: { type: string }) {
  const map: Record<string, string> = {
    MENS: 'bg-blue-50 text-blue-700 ring-blue-200',
    WOMENS: 'bg-pink-50 text-pink-700 ring-pink-200',
    UNISEX: 'bg-violet-50 text-violet-700 ring-violet-200',
  };
  const cls = map[type] || 'bg-gray-100 text-gray-500 ring-gray-200';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
        cls
      )}
    >
      {type}
    </span>
  );
}

export const createShopApprovalColumns = (): ColumnDef<PendingApprovalShopDto>[] => [
  {
    accessorKey: 'name',
    header: 'Shop Name',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'shopType',
    header: 'Type',
    cell: ({ row }) => <ShopTypePill type={row.getValue('shopType')} />,
  },
  {
    id: 'vendor',
    header: 'Vendor',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.vendorName}</span>
    ),
  },
  {
    id: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">{row.original.vendorPhone}</span>
    ),
  },
  {
    id: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const { area, city } = row.original.address;
      return (
        <span className="text-sm text-muted-foreground">
          {area}, {city}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.getValue('createdAt')), 'dd MMM yyyy')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button asChild size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
        <Link href={`/dashboard/shops/approval/${row.original.id}`}>
          View Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    ),
  },
];
