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

const CATEGORY = 'search_settings';
const KEYS = ['shop_max_distance_meters', 'recommended_shops_max_distance_meters'] as const;

type SearchKey = (typeof KEYS)[number];

export function SearchSettings() {
  const { data, isLoading } = useConfigsByCategory(CATEGORY);
  const { mutateAsync: updateConfig, isPending } = useUpdateConfig();

  const [values, setValues] = useState<Record<SearchKey, string>>({
    shop_max_distance_meters: '10000',
    recommended_shops_max_distance_meters: '20000',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.configs) {
      const next = { ...values };
      for (const config of data.configs) {
        if (KEYS.includes(config.key as SearchKey)) {
          next[config.key as SearchKey] = config.value;
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
      setError(e instanceof Error ? e.message : 'Failed to save search settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">Search Settings</CardTitle>
        <CardDescription>
          Configure search radius limits for nearby and recommended shop discovery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="shop_max_distance_meters">Shop Search Radius (meters)</Label>
              <Input
                id="shop_max_distance_meters"
                type="number"
                value={values.shop_max_distance_meters}
                onChange={(e) =>
                  setValues((v) => ({ ...v, shop_max_distance_meters: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Radius for nearby shop search results.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recommended_shops_max_distance_meters">
                Recommended Shops Radius (meters)
              </Label>
              <Input
                id="recommended_shops_max_distance_meters"
                type="number"
                value={values.recommended_shops_max_distance_meters}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    recommended_shops_max_distance_meters: e.target.value,
                  }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Radius for recommended shop discovery.
              </p>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">Search settings saved successfully.</p>}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save Search Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
