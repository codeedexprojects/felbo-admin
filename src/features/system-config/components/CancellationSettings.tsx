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
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useConfigsByCategory, useUpdateConfig } from '../hooks';

const CATEGORY = 'cancellation_settings';
const KEYS = ['free_cancellation_window_minutes', 'late_cancellation_fee_percent'] as const;

type CancellationKey = (typeof KEYS)[number];

export function CancellationSettings() {
  const { data, isLoading } = useConfigsByCategory(CATEGORY);
  const { mutateAsync: updateConfig, isPending } = useUpdateConfig();

  const [values, setValues] = useState<Record<CancellationKey, string>>({
    free_cancellation_window_minutes: '30',
    late_cancellation_fee_percent: '50',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.configs) {
      const next = { ...values };
      for (const config of data.configs) {
        if (KEYS.includes(config.key as CancellationKey)) {
          next[config.key as CancellationKey] = config.value;
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
      setError(e instanceof Error ? e.message : 'Failed to save cancellation settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">Cancellation Settings</CardTitle>
        <CardDescription>
          Define refund rules and penalties for user-initiated cancellations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="free_cancellation_window_minutes">
                Free Cancellation Window (minutes)
              </Label>
              <Input
                id="free_cancellation_window_minutes"
                type="number"
                value={values.free_cancellation_window_minutes}
                onChange={(e) =>
                  setValues((v) => ({ ...v, free_cancellation_window_minutes: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Full refund period after booking is made.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="late_cancellation_fee_percent">Late Cancellation Fee (%)</Label>
              <div className="relative">
                <Input
                  id="late_cancellation_fee_percent"
                  type="number"
                  value={values.late_cancellation_fee_percent}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, late_cancellation_fee_percent: e.target.value }))
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground text-xs font-medium">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Percentage deducted if cancelled after the free window.
              </p>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Cancellation settings saved successfully.</p>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save Cancellation Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
