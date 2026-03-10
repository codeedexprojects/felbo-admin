'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { CategoryTable } from '@/features/category/components/CategoryTable';

export default function CategoriesPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6">
        <PageHeader
          title="Categories"
          description="Manage service categories displayed to users."
        />
        <CategoryTable />
      </div>
    </RoleGuard>
  );
}
