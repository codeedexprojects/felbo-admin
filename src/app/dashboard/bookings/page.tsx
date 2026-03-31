'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { BookingsTable } from '@/features/bookings/components/BookingsTable';
import { useAuthStore } from '@/stores/authStore';

export default function BookingsPage() {
  const { admin } = useAuthStore();
  const isAssocAdmin = admin?.role === 'ASSOCIATION_ADMIN';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description={
          isAssocAdmin
            ? 'Manage bookings for shops under your association.'
            : 'Manage platform-wide bookings and reservations.'
        }
      />
      <BookingsTable />
    </div>
  );
}
