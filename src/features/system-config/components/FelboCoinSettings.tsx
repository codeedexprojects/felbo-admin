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

const CATEGORY = 'felbocoin_settings';
const KEYS = [
  'coin_earn_per_booking',
  'coin_redeem_threshold',
  'coin_cancellation_refund_coins',
] as const;

type FelboCoinKey = (typeof KEYS)[number];

export function FelboCoinSettings() {
  const { data, isLoading } = useConfigsByCategory(CATEGORY);
  const { mutateAsync: updateConfig, isPending } = useUpdateConfig();

  const [values, setValues] = useState<Record<FelboCoinKey, string>>({
    coin_earn_per_booking: '1',
    coin_redeem_threshold: '10',
    coin_cancellation_refund_coins: '5',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data?.configs) {
      const next = { ...values };
      for (const config of data.configs) {
        if (KEYS.includes(config.key as FelboCoinKey)) {
          next[config.key as FelboCoinKey] = config.value;
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
      setError(e instanceof Error ? e.message : 'Failed to save FelboCoin settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">FelboCoin Settings</CardTitle>
        <CardDescription>
          Configure how FelboCoins are earned, redeemed, and refunded on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="coin_earn_per_booking">Coins Earned Per Booking</Label>
              <Input
                id="coin_earn_per_booking"
                type="number"
                value={values.coin_earn_per_booking}
                onChange={(e) =>
                  setValues((v) => ({ ...v, coin_earn_per_booking: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Number of coins credited when a booking is completed.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coin_redeem_threshold">Coin Redemption Threshold</Label>
              <Input
                id="coin_redeem_threshold"
                type="number"
                value={values.coin_redeem_threshold}
                onChange={(e) =>
                  setValues((v) => ({ ...v, coin_redeem_threshold: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Minimum coins required to use FelboCoin payment (10 coins = ₹10 advance waived).
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coin_cancellation_refund_coins">Cancellation Refund (coins)</Label>
              <Input
                id="coin_cancellation_refund_coins"
                type="number"
                value={values.coin_cancellation_refund_coins}
                onChange={(e) =>
                  setValues((v) => ({ ...v, coin_cancellation_refund_coins: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Coins credited when a user cancels within the free cancellation window.
              </p>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">FelboCoin settings saved successfully.</p>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending || isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Save FelboCoin Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
