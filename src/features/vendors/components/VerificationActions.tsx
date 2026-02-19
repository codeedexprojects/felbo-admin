'use client';

import { useState } from 'react';
import React from 'react';
import { CheckCircle2, XCircle, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { useVerifyVendor, useRejectVendor } from '@/features/vendors/hooks';
import { Vendor } from '@/features/vendors/types';

interface VerificationActionsProps {
  vendor: Vendor;
}

export function VerificationActions({ vendor }: VerificationActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [reason, setReason] = useState('');

  const verifyMutation = useVerifyVendor();
  const rejectMutation = useRejectVendor();

  const handleApprove = async () => {
    try {
      await verifyMutation.mutateAsync(vendor.id);
      setApproveOpen(false);
      // Optional: Add a localized success feedback if desired
    } catch (error: unknown) {
      alert((error as Error).message || 'Failed to approve vendor');
    }
  };

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      alert('Please provide a rejection reason (min 5 characters)');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: vendor.id, reason });
      setRejectOpen(false);
    } catch (error: unknown) {
      alert((error as Error).message || 'Failed to reject vendor');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Approve */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Vendor Application?</DialogTitle>
            <DialogDescription>
              This will approve the vendor <strong>{vendor.ownerName}</strong>. They will be able to
              log in and start accepting bookings immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Reject Application
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. The vendor will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Invalid ID proof, Shop location verify failed..."
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DocumentPreview({ vendor }: { vendor: Vendor }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <FileText className="h-3.5 w-3.5" />
          View Docs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verification Documents</DialogTitle>
          <DialogDescription>Documents submitted by {vendor.ownerName}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Registration Type</Label>
              <div className="font-medium p-2 bg-muted rounded-md text-sm">
                {vendor.registrationType?.replace('_', ' ') || 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Vendor ID</Label>
              <div className="font-medium p-2 bg-muted rounded-md text-sm font-mono">
                {vendor.id}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200 w-full flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Note: Document images are not yet fully integrated in the API response type. Using
              placeholders.
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
