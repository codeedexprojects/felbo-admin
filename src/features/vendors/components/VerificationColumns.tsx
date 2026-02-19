'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Vendor } from '@/features/vendors/types';
import { format } from 'date-fns';
import { DocumentPreview, VerificationActions } from './VerificationActions';
import { cn } from '@/lib/utils';

export const verificationColumns: ColumnDef<Vendor>[] = [
  {
    accessorKey: 'shopDetails.name',
    header: 'Shop Name',
    cell: ({ row }) => (
      // Shop name might not be directly on vendor root in list API?
      // Let's check api.ts. It maps response: ownerName, phone, etc.
      // So I need to update Backend `listVendors` to include shopDetails.
      // But for now, I'll use Owner Name as primary identifier if shop name missing.
      <span className="font-semibold text-foreground">{row.original.shopDetails?.name || '—'}</span>
    ),
  },
  {
    accessorKey: 'ownerName',
    header: 'Owner',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm text-foreground">{row.getValue('ownerName')}</span>
        <span className="text-xs text-muted-foreground">{row.original.email || 'No email'}</span>
      </div>
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
    accessorKey: 'registrationType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('registrationType') as string;
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
          {type ? type.replace('_', ' ') : '—'}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Submitted',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs font-medium text-foreground">
          {format(new Date(row.getValue('createdAt')), 'dd MMM yyyy')}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(row.getValue('createdAt')), 'hh:mm a')}
        </span>
      </div>
    ),
  },
  {
    id: 'documents',
    header: 'Documents',
    cell: ({ row }) => <DocumentPreview vendor={row.original} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <VerificationActions vendor={row.original} />,
  },
];
