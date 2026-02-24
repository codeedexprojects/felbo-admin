'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { UserTable } from '@/features/users/components/UserTable';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage your platform users and their access." />
      <UserTable />
    </div>
  );
}
