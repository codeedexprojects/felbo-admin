'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { VendorVerificationTable } from '@/features/vendors/components/VendorVerificationTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function VerificationRequestsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
    // Keep the spin for a brief moment so it feels responsive
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <PageHeader
          title="Verification Requests"
          description="Review and approve or reject vendor registration applications."
          action={
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs bg-card"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw
                className={cn('h-3.5 w-3.5 transition-transform', isRefreshing && 'animate-spin')}
              />
              Refresh
            </Button>
          }
        />
        <VendorVerificationTable />
      </div>
    </RoleGuard>
  );
}
