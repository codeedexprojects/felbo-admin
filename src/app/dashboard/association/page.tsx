'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { AssociationVendorTable } from '@/features/association/components/AssociationVendorTable';

export default function AssociationVendorsPage() {
  return (
    <RoleGuard allowedRoles={['ASSOCIATION_ADMIN']}>
      <div className="space-y-6">
        <PageHeader title="My Vendors" description="Vendors registered under your association." />
        <AssociationVendorTable />
      </div>
    </RoleGuard>
  );
}
