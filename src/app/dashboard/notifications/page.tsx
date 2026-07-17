'use client';

import { BellRing, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { BroadcastNotificationForm } from '@/features/notifications/components/BroadcastNotificationForm';

export default function NotificationsPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6 max-w-3xl mx-auto pb-10">
        <PageHeader
          title="Push Notifications"
          description="Broadcast push notifications to users, barbers, vendors, or everyone on the platform."
        />

        <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
          <div className="flex gap-3">
            <ShieldAlert className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-orange-900">Broadcast Warning</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                Notifications are sent immediately to all devices in the selected audience. This
                action cannot be undone. Ensure the message is accurate before sending.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BellRing className="h-4 w-4" />
          <span>Compose your message below and choose who receives it.</span>
        </div>

        <BroadcastNotificationForm />
      </div>
    </RoleGuard>
  );
}
