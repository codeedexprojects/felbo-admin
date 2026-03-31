'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfigsByCategory, useUpdateConfig } from '../hooks';

const CATEGORY = 'booking_settings';
const KEYS = [
  'min_booking_buffer_minutes',
  'appointment_buffer_minutes',
  'booking_amount',
  'slot_interval_minutes',
  'walk_in_fallback_duration_minutes',
] as const;

type BookingKey = (typeof KEYS)[number];

export function BookingSettings() {
  const { data, isLoading } = useConfigsByCategory(CATEGORY);
  const { mutateAsync: updateConfig, isPending } = useUpdateConfig();

  const [values, setValues] = useState<Record<BookingKey, string>>({
    min_booking_buffer_minutes: '30',
    appointment_buffer_minutes: '5',
    booking_amount: '10',
    slot_interval_minutes: '15',
    walk_in_fallback_duration_minutes: '30',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.configs) {
      const next = { ...values };
      for (const config of data.configs) {
        if (KEYS.includes(config.key as BookingKey)) {
          next[config.key as BookingKey] = config.value;
        }
      }
      setValues(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    try {
      await Promise.all(KEYS.map((key) => updateConfig({ key, value: values[key] })));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save booking settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg text-primary">Booking Settings</CardTitle>
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
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="min_booking_buffer_minutes">Minimum Booking Buffer (minutes)</Label>
              <Input
                id="min_booking_buffer_minutes"
                type="number"
                value={values.min_booking_buffer_minutes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, min_booking_buffer_minutes: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Earliest possible slot from the current time.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appointment_buffer_minutes">Appointment Buffer (minutes)</Label>
              <Input
                id="appointment_buffer_minutes"
                type="number"
                value={values.appointment_buffer_minutes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, appointment_buffer_minutes: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">Gap between consecutive bookings.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="booking_amount">Booking Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="booking_amount"
                  type="number"
                  value={values.booking_amount}
                  onChange={(e) => setValues((v) => ({ ...v, booking_amount: e.target.value }))}
                  className="pl-7"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Advance payment amount collected during online booking.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slot_interval_minutes">Slot Interval (minutes)</Label>
              <Input
                id="slot_interval_minutes"
                type="number"
                value={values.slot_interval_minutes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, slot_interval_minutes: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Display interval for available time slots.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walk_in_fallback_duration_minutes">
                Walk-in Fallback Duration (minutes)
              </Label>
              <Input
                id="walk_in_fallback_duration_minutes"
                type="number"
                value={values.walk_in_fallback_duration_minutes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, walk_in_fallback_duration_minutes: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Default walk-in slot duration when no services are selected.
              </p>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">Booking settings saved successfully.</p>}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save Booking Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
