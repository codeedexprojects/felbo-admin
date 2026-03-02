'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { BookingsTable } from '@/features/bookings/components/BookingsTable';

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Manage platform bookings and reservations." />
      <BookingsTable />
    </div>
  );
}
