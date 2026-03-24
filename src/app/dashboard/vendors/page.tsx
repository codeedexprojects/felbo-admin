'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { VendorTable } from '@/features/vendors/components/VendorTable';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useVerificationRequests } from '@/features/vendors/hooks';

export default function VendorsPage() {
  const { data } = useVerificationRequests({ page: 1, limit: 1 });
  const pendingCount = data?.counts?.pending ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your vendors and monitor their verification status."
        action={
          <Button asChild size="sm" className="h-8 gap-1.5 bg-primary hover:bg-primary/90">
            <Link href="/dashboard/vendors/requests">
              <ClipboardList className="h-3.5 w-3.5" />
              Review Requests
              {pendingCount > 0 && (
                <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </Link>
          </Button>
        }
      />
      <VendorTable />
    </div>
  );
}
