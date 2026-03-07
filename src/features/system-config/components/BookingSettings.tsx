'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function BookingSettings() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Booking Settings</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Core scheduling and slot generation parameters.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Configure how slots are generated and the minimum lead time for bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="minBuffer">Minimum Booking Buffer (minutes)</Label>
            <Input id="minBuffer" type="number" defaultValue={30} />
            <p className="text-[11px] text-muted-foreground">
              Earliest possible slot from the current time.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="appointmentBuffer">Appointment Buffer (minutes)</Label>
            <Input id="appointmentBuffer" type="number" defaultValue={5} />
            <p className="text-[11px] text-muted-foreground">Gap between consecutive bookings.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slotInterval">Slot Interval (minutes)</Label>
            <Input id="slotInterval" type="number" defaultValue={15} />
            <p className="text-[11px] text-muted-foreground">
              Display interval for available time slots.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
