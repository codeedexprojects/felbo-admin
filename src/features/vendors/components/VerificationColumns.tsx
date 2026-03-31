'use client';

import { ColumnDef } from '@tanstack/react-table';
import { VerificationRequestItem } from '@/features/vendors/types';
import { format } from 'date-fns';
import { VerificationActions } from './VerificationActions';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

function ViewCell({ item }: { item: VerificationRequestItem }) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 text-xs border-border/60"
      onClick={() => router.push(`/dashboard/vendors/requests/${item.id}`)}
    >
      <Eye className="h-3 w-3" />
      View
    </Button>
  );
}

export const createVerificationColumns = (): ColumnDef<VerificationRequestItem>[] => [
  {
    id: 'serialNumber',
    header: 'Sl No',
    cell: ({ row }) => (
      <span className="text-xs font-medium text-muted-foreground">{row.original.slNo}</span>
    ),
  },
  {
    accessorKey: 'shopName',
    header: 'Shop Name',
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">{row.getValue('shopName') || '—'}</span>
    ),
  },
  {
    accessorKey: 'ownerName',
    header: 'Owner',
    cell: ({ row }) => (
      <span className="font-medium text-sm text-foreground">{row.getValue('ownerName')}</span>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
        {row.getValue('phone')}
      </span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const isIndie = type === 'INDEPENDENT';
      return (
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border',
            isIndie
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          )}
        >
          {type?.replace('_', ' ') ?? '—'}
        </span>
      );
    },
  },
  {
    accessorKey: 'submitted',
    header: 'Submitted',
    cell: ({ row }) => {
      const submitted = row.getValue('submitted') as string;
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground">
            {format(new Date(submitted), 'dd MMM yyyy')}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(submitted), 'hh:mm a')}
          </span>
        </div>
      );
    },
  },
  {
    id: 'view',
    cell: ({ row }) => <ViewCell item={row.original} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      // VerificationActions expects a Vendor shape — pass minimum required fields
      const item = row.original;
      return (
        <VerificationActions
          vendor={{
            id: item.id,
            ownerName: item.ownerName,
            phone: item.phone,
            email: null,
            verificationStatus: 'PENDING',
            status: 'PENDING',
            createdAt: item.submitted,
          }}
        />
      );
    },
  },
];
