'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/button';
import { RegistrationsTable } from '@/features/finance/components/RegistrationsTable';

export default function RegistrationsPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <PageHeader
          title="Vendor Registrations"
          description="Track incoming registration fees from independent vendors."
          action={
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/dashboard/finance/revenue">
                <ArrowLeft className="h-4 w-4" />
                Back to Revenue
              </Link>
            </Button>
          }
        />
        <RegistrationsTable />
      </div>
    </RoleGuard>
  );
}
