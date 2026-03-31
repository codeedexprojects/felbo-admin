'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ShopApprovalTable } from '@/features/shops/components/ShopApprovalTable';

export default function ShopApprovalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shop Approvals"
        description="Review and approve shops submitted by vendors."
      />
      <ShopApprovalTable />
    </div>
  );
}
