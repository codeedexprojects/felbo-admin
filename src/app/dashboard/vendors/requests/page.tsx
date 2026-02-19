'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { VendorVerificationTable } from '@/features/vendors/components/VendorVerificationTable';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function VerificationRequestsPage() {
  const queryClient = useQueryClient();

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
      <div className="space-y-6">
        <PageHeader
          title="Verification Requests"
          description="Review and approve or reject vendor registration applications."
          action={
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs bg-card"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['vendors'] })}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          }
        />
        <VendorVerificationTable />
      </div>
    </RoleGuard>
  );
}
