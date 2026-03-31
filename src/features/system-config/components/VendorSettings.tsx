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
import { HelpCircle, Save, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfigsByCategory, useUpdateConfig } from '../hooks';

const CATEGORY = 'vendor_settings';
const KEYS = ['vendor_registration_fee', 'vendor_registration_gst_percentage'] as const;

type VendorKey = (typeof KEYS)[number];

export function VendorSettings() {
  const { data, isLoading } = useConfigsByCategory(CATEGORY);
  const { mutateAsync: updateConfig, isPending } = useUpdateConfig();

  const [values, setValues] = useState<Record<VendorKey, string>>({
    vendor_registration_fee: '50',
    vendor_registration_gst_percentage: '18',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.configs) {
      const next = { ...values };
      for (const config of data.configs) {
        if (KEYS.includes(config.key as VendorKey)) {
          next[config.key as VendorKey] = config.value;
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
      setError(e instanceof Error ? e.message : 'Failed to save vendor settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg text-primary">Vendor Settings</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Onboarding and registration parameters for vendors.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Configure fees and taxes applicable to new vendor registrations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="vendor_registration_fee">Registration Fee (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="vendor_registration_fee"
                  type="number"
                  value={values.vendor_registration_fee}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, vendor_registration_fee: e.target.value }))
                  }
                  className="pl-7"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                One-time fee charged to independent vendors (excluding GST).
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendor_registration_gst_percentage">Registration GST (%)</Label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  %
                </span>
                <Input
                  id="vendor_registration_gst_percentage"
                  type="number"
                  value={values.vendor_registration_gst_percentage}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, vendor_registration_gst_percentage: e.target.value }))
                  }
                  className="pr-7"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                GST percentage applied on top of the registration fee.
              </p>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">Vendor settings saved successfully.</p>}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save Vendor Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
