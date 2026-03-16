'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  ReceiptIndianRupee,
  Ban,
  Search,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { BookingSettings } from '@/features/system-config/components/BookingSettings';
import { CancellationSettings } from '@/features/system-config/components/CancellationSettings';
import { AbuseLimits } from '@/features/system-config/components/AbuseLimits';
import { SearchSettings } from '@/features/system-config/components/SearchSettings';
import { IssueSettings } from '@/features/system-config/components/IssueSettings';
import { FelboCoinSettings } from '@/features/system-config/components/FelboCoinSettings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ConfigSection = 'booking' | 'cancellation' | 'abuse' | 'search' | 'issue' | 'felbocoin';

export default function SystemConfigPage() {
  const [activeSection, setActiveSection] = useState<ConfigSection>('booking');

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <PageHeader
          title="System Configuration"
          description="Manage global business rules, scheduling parameters, and platform limits."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-border/60">
          <div className="space-y-0.5">
            <h3 className="text-sm font-medium">Active Configuration Category</h3>
            <p className="text-xs text-muted-foreground">
              Select a section to modify its settings.
            </p>
          </div>
          <Select
            value={activeSection}
            onValueChange={(value) => setActiveSection(value as ConfigSection)}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-500" />
                  <span>Booking Settings</span>
                </div>
              </SelectItem>
              <SelectItem value="cancellation">
                <div className="flex items-center gap-2">
                  <ReceiptIndianRupee className="h-4 w-4 text-emerald-500" />
                  <span>Cancellation Settings</span>
                </div>
              </SelectItem>
              <SelectItem value="abuse">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-500" />
                  <span>Abuse Limits</span>
                </div>
              </SelectItem>
              <SelectItem value="search">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-violet-500" />
                  <span>Search Settings</span>
                </div>
              </SelectItem>
              <SelectItem value="issue">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>Issue Settings</span>
                </div>
              </SelectItem>
              <SelectItem value="felbocoin">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span>FelboCoin Settings</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          {activeSection === 'booking' && <BookingSettings />}
          {activeSection === 'cancellation' && <CancellationSettings />}
          {activeSection === 'abuse' && <AbuseLimits />}
          {activeSection === 'search' && <SearchSettings />}
          {activeSection === 'issue' && <IssueSettings />}
          {activeSection === 'felbocoin' && <FelboCoinSettings />}
        </div>
      </div>
    </RoleGuard>
  );
}
