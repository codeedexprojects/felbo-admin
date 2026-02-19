'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { VendorTable } from '@/features/vendors/components/VendorTable';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function VendorsPage() {
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
            </Link>
          </Button>
        }
      />
      <VendorTable />
    </div>
  );
}
