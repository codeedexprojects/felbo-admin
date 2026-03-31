'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { AvatarList } from '@/features/avatars/components/AvatarList';
import { UserCircle } from 'lucide-react';

export default function AvatarsPage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-4 sm:px-0">
          <div className="space-y-1.5 flex flex-col items-start gap-1">
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 shadow-sm mb-1.5">
              <UserCircle className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Barber Personalization
              </span>
            </div>
            <PageHeader
              title="Avatar Management"
              description="Control the curated bank of barber profile images available to vendors."
            />
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm border border-border/40 rounded-[2rem] p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-muted-foreground/5 opacity-40 select-none pointer-events-none">
            <UserCircle className="h-48 w-48 rotate-12" />
          </div>

          <div className="relative z-10">
            <AvatarList />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
