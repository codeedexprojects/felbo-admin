'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CancellationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cancellation Settings</CardTitle>
        <CardDescription>
          Define refund rules and penalties for user-initiated cancellations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="freeWindow">Free Cancellation Window (minutes)</Label>
            <Input id="freeWindow" type="number" defaultValue={30} />
            <p className="text-[11px] text-muted-foreground">
              Full refund period after booking is made.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lateFee">Late Cancellation Fee (%)</Label>
            <div className="relative">
              <Input id="lateFee" type="number" defaultValue={50} className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground text-xs font-medium">
                %
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Percentage deducted if cancelled after the free window.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
