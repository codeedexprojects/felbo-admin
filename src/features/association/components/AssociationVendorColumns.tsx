'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Vendor } from '@/features/association/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

function StatusPill({ status, type }: { status: string; type: 'verification' | 'account' }) {
  const verificationMap: Record<string, string> = {
    APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    REJECTED: 'bg-red-50 text-red-600 ring-red-200',
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  };
  const accountMap: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    SUSPENDED: 'bg-red-50 text-red-600 ring-red-200',
    DELETED: 'bg-gray-100 text-gray-500 ring-gray-200',
    PENDING: 'bg-gray-100 text-gray-500 ring-gray-200',
  };

  const map = type === 'verification' ? verificationMap : accountMap;
  const cls = map[status] || 'bg-gray-100 text-gray-500 ring-gray-200';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
        cls
      )}
    >
      {status}
    </span>
  );
}

function ActionCell({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-sm"
          onClick={() => router.push(`/dashboard/association/${vendor.id}`)}
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          View details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AssociationVendorColumnsProps {
  pageIndex: number;
  pageSize: number;
  totalVendors: number;
}

export const createAssociationVendorColumns = ({
  pageIndex,
  pageSize,
  totalVendors,
}: AssociationVendorColumnsProps): ColumnDef<Vendor>[] => [
  {
    id: 'serialNumber',
    header: 'Sl No',
    cell: ({ row }) => (
      <span className="text-xs font-medium text-muted-foreground">
        {totalVendors - pageIndex * pageSize - row.index}
      </span>
    ),
  },
  {
    accessorKey: 'ownerName',
    header: 'Owner Name',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.getValue('ownerName')}</span>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">{row.getValue('phone')}</span>
    ),
  },
  {
    accessorKey: 'verificationStatus',
    header: 'Verification',
    cell: ({ row }) => (
      <StatusPill status={row.getValue('verificationStatus')} type="verification" />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.getValue('status')} type="account" />,
  },
  {
    accessorKey: 'registered',
    header: 'Registered',
    cell: ({ row }) => {
      const raw = row.getValue('registered') as string | undefined;
      if (!raw) return <span className="text-xs text-muted-foreground">—</span>;
      const date = new Date(raw);
      if (isNaN(date.getTime())) return <span className="text-xs text-muted-foreground">—</span>;
      return <span className="text-xs text-muted-foreground">{format(date, 'dd MMM yyyy')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell vendor={row.original} />,
  },
];
