'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useUpdateVendorProfile } from '../hooks';
import { vendorProfileSchema, VendorProfileFormValues } from '../schema';

export interface VendorProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  ownerName: string;
  email: string | null;
}

export function VendorProfileEditDialog({
  open,
  onClose,
  vendorId,
  ownerName,
  email,
}: VendorProfileEditDialogProps) {
  const mutation = useUpdateVendorProfile(vendorId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<VendorProfileFormValues>({
    resolver: zodResolver(vendorProfileSchema),
  });

  useEffect(() => {
    if (open) reset({ ownerName, email: email ?? '' });
  }, [open, ownerName, email, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: VendorProfileFormValues) => {
    mutation.mutate(
      { ownerName: data.ownerName, email: data.email || undefined },
      {
        onSuccess: handleClose,
        onError: (err) => setError('root', { message: err.message }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit Vendor Profile
          </DialogTitle>
          <DialogDescription>Update this vendor&apos;s owner name and email.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ownerName" className="text-sm">
              Owner Name
            </Label>
            <Input id="ownerName" className="h-9" {...register('ownerName')} />
            {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input id="email" type="email" className="h-9" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {errors.root && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-200">
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
