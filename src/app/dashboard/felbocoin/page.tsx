'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FelboCoinDashboard } from '@/features/felbocoin/components/FelboCoinDashboard';

export default function FelboCoinPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="FelboCoin Management"
        description="Monitor coin circulation, manage user balances, and audit admin actions."
      />
      <FelboCoinDashboard />
    </div>
  );
}
