'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AbuseLimits() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Abuse Limits</CardTitle>
        <CardDescription>
          Automated thresholds to prevent platform abuse by users and vendors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            User Limits
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="userCancelLimit">User Cancel Limit (per week)</Label>
              <Input id="userCancelLimit" type="number" defaultValue={5} />
              <p className="text-[11px] text-muted-foreground">
                Max cancellations before automatic block.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blockDuration">User Block Duration (hours)</Label>
              <Input id="blockDuration" type="number" defaultValue={24} />
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
              <Label htmlFor="vendorWarning">Vendor Cancel Warning (%)</Label>
              <div className="relative">
                <Input id="vendorWarning" type="number" defaultValue={10} className="pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cancellation rate threshold to trigger a warning.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendorReview">Vendor Cancel Review (%)</Label>
              <div className="relative">
                <Input id="vendorReview" type="number" defaultValue={20} className="pr-8" />
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
      </CardContent>
    </Card>
  );
}
