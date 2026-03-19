'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CancellationsTable } from '@/features/cancellation/components/CancellationsTable';

export default function CancellationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancellation Management"
        description="View and manage all cancelled bookings across the platform."
      />
      <CancellationsTable />
    </div>
  );
}
