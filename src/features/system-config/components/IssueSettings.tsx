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

const CATEGORY = 'issue_settings';
const KEYS = ['issue_max_distance_meters'] as const;

type IssueKey = (typeof KEYS)[number];

export function IssueSettings() {
  const { data, isLoading } = useConfigsByCategory(CATEGORY);
  const { mutateAsync: updateConfig, isPending } = useUpdateConfig();

  const [values, setValues] = useState<Record<IssueKey, string>>({
    issue_max_distance_meters: '500',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.configs) {
      const next = { ...values };
      for (const config of data.configs) {
        if (KEYS.includes(config.key as IssueKey)) {
          next[config.key as IssueKey] = config.value;
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
      setError(e instanceof Error ? e.message : 'Failed to save issue settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">Issue Settings</CardTitle>
        <CardDescription>
          Configure proximity constraints for users raising issues against shops.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="issue_max_distance_meters">Issue Max Distance (meters)</Label>
              <Input
                id="issue_max_distance_meters"
                type="number"
                value={values.issue_max_distance_meters}
                onChange={(e) =>
                  setValues((v) => ({ ...v, issue_max_distance_meters: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Maximum distance from a shop within which a user can raise an issue.
              </p>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">Issue settings saved successfully.</p>}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save Issue Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
