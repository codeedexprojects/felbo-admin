'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Issue, IssueStatus, IssueType, ISSUE_TYPE_LABELS } from '@/features/issues/types';

function StatusPill({ status }: { status: IssueStatus }) {
  const map: Record<IssueStatus, string> = {
    OPEN: 'bg-amber-50 text-amber-700 ring-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    REJECTED: 'bg-red-50 text-red-600 ring-red-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
        map[status]
      )}
    >
      {status}
    </span>
  );
}

function TypePill({ type }: { type: IssueType }) {
  const map: Record<IssueType, string> = {
    SHOP_CLOSED: 'bg-slate-50 text-slate-700 ring-slate-200',
    BARBER_UNAVAILABLE: 'bg-purple-50 text-purple-700 ring-purple-200',
    SERVICE_NOT_PROVIDED: 'bg-orange-50 text-orange-700 ring-orange-200',
    QUALITY_ISSUE: 'bg-blue-50 text-blue-700 ring-blue-200',
    OTHER: 'bg-gray-100 text-gray-600 ring-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
        map[type]
      )}
    >
      {ISSUE_TYPE_LABELS[type]}
    </span>
  );
}

export const issueColumns: ColumnDef<Issue>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <TypePill type={row.getValue('type')} />,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = row.getValue<string>('description');
      return (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[280px]" title={desc}>
          {desc}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.getValue('status')} />,
  },
  {
    accessorKey: 'bookingId',
    header: 'Booking ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue<string>('bookingId').slice(-8)}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Reported',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.getValue('createdAt')), 'dd MMM yyyy')}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link href={`/dashboard/issues/${row.original.id}`}>
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
      </Button>
    ),
  },
];
