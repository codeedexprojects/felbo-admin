'use client';

import React from 'react';
import { Save, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/button';
import { BookingSettings } from '@/features/system-config/components/BookingSettings';
import { CancellationSettings } from '@/features/system-config/components/CancellationSettings';
import { AbuseLimits } from '@/features/system-config/components/AbuseLimits';

export default function SystemConfigPage() {
  const handleSave = () => {
    // API integration will come later
    console.log('Save settings clicked');
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <PageHeader
          title="System Configuration"
          description="Manage global business rules, scheduling parameters, and platform limits."
        />

        <div className="rounded-xl border border-yellow-100 bg-yellow-50/50 p-4">
          <div className="flex gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-yellow-900">Critical Settings</p>
              <p className="text-xs text-yellow-700 leading-relaxed">
                Changes to these values affect core platform behavior including booking
                availability, refund calculations, and automated fraud prevention. Proceed with
                caution.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <BookingSettings />
          <CancellationSettings />
          <AbuseLimits />
        </div>

        <div className="flex justify-end pt-4 border-t border-border/60">
          <Button onClick={handleSave} size="lg" className="px-8 gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </RoleGuard>
  );
}
