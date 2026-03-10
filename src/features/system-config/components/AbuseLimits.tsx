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

const CATEGORY = 'abuse_limits';
const KEYS = [
  'user_cancel_limit_per_week',
  'user_block_duration_hours',
  'vendor_cancel_warning_threshold_percent',
  'vendor_cancel_review_threshold_percent',
] as const;

type AbuseKey = (typeof KEYS)[number];

export function AbuseLimits() {
  const { data, isLoading } = useConfigsByCategory(CATEGORY);
  const { mutateAsync: updateConfig, isPending } = useUpdateConfig();

  const [values, setValues] = useState<Record<AbuseKey, string>>({
    user_cancel_limit_per_week: '5',
    user_block_duration_hours: '24',
    vendor_cancel_warning_threshold_percent: '10',
    vendor_cancel_review_threshold_percent: '20',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.configs) {
      const next = { ...values };
      for (const config of data.configs) {
        if (KEYS.includes(config.key as AbuseKey)) {
          next[config.key as AbuseKey] = config.value;
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
      setError(e instanceof Error ? e.message : 'Failed to save abuse limits');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">Abuse Limits</CardTitle>
        <CardDescription>
          Automated thresholds to prevent platform abuse by users and vendors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                User Limits
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="user_cancel_limit_per_week">User Cancel Limit Per Week</Label>
                  <Input
                    id="user_cancel_limit_per_week"
                    type="number"
                    value={values.user_cancel_limit_per_week}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, user_cancel_limit_per_week: e.target.value }))
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Max cancellations before automatic block.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user_block_duration_hours">User Block Duration (hours)</Label>
                  <Input
                    id="user_block_duration_hours"
                    type="number"
                    value={values.user_block_duration_hours}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, user_block_duration_hours: e.target.value }))
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Duration of the automatic user block.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Vendor Monitoring
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="vendor_cancel_warning_threshold_percent">
                    Vendor Cancel Warning Threshold (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="vendor_cancel_warning_threshold_percent"
                      type="number"
                      value={values.vendor_cancel_warning_threshold_percent}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          vendor_cancel_warning_threshold_percent: e.target.value,
                        }))
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cancellation rate threshold to trigger a warning.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vendor_cancel_review_threshold_percent">
                    Vendor Cancel Review Threshold (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="vendor_cancel_review_threshold_percent"
                      type="number"
                      value={values.vendor_cancel_review_threshold_percent}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          vendor_cancel_review_threshold_percent: e.target.value,
                        }))
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cancellation rate threshold to trigger manual review.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">Abuse limits saved successfully.</p>}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save Abuse Limits'}
        </Button>
      </CardFooter>
    </Card>
  );
}
