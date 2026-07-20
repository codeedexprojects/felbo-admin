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

import { useUpdateBarber } from '../hooks';
import { barberEditSchema, BarberEditFormValues } from '../schema';

export interface BarberEditDialogProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  barberId: string;
  name: string;
  phone: string;
}

export function BarberEditDialog({
  open,
  onClose,
  vendorId,
  barberId,
  name,
  phone,
}: BarberEditDialogProps) {
  const mutation = useUpdateBarber(vendorId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<BarberEditFormValues>({
    resolver: zodResolver(barberEditSchema),
  });

  useEffect(() => {
    if (open) reset({ name, phone });
  }, [open, name, phone, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: BarberEditFormValues) => {
    mutation.mutate(
      { barberId, input: data },
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
            Edit Barber
          </DialogTitle>
          <DialogDescription>Update this barber&apos;s name and phone.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-sm">
              Name
            </Label>
            <Input id="name" className="h-9" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone" className="text-sm">
              Phone
            </Label>
            <Input id="phone" className="h-9" {...register('phone')} />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
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
