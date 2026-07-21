'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useUpdateShopService } from '../hooks';
import { serviceEditSchema, ServiceEditFormValues } from '../schema';

export interface ServiceEditDialogProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  shopId: string;
  serviceId: string;
  name: string;
  basePrice: number;
  baseDurationMinutes: number;
  description?: string;
}

export function ServiceEditDialog({
  open,
  onClose,
  vendorId,
  shopId,
  serviceId,
  name,
  basePrice,
  baseDurationMinutes,
  description,
}: ServiceEditDialogProps) {
  const mutation = useUpdateShopService(vendorId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<ServiceEditFormValues>({
    resolver: zodResolver(serviceEditSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name,
        basePrice,
        baseDurationMinutes,
        description: description ?? '',
      });
    }
  }, [open, name, basePrice, baseDurationMinutes, description, reset]);

  const applicableFor = watch('applicableFor');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: ServiceEditFormValues) => {
    mutation.mutate(
      { shopId, serviceId, input: data },
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
            Edit Service
          </DialogTitle>
          <DialogDescription>Update this service&apos;s details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-sm">
              Service Name
            </Label>
            <Input id="name" className="h-9" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="basePrice" className="text-sm">
                Base Price (₹)
              </Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                step="0.01"
                className="h-9"
                {...register('basePrice', { valueAsNumber: true })}
              />
              {errors.basePrice && (
                <p className="text-xs text-red-500">{errors.basePrice.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="baseDurationMinutes" className="text-sm">
                Duration (min)
              </Label>
              <Input
                id="baseDurationMinutes"
                type="number"
                min={5}
                max={180}
                className="h-9"
                {...register('baseDurationMinutes', { valueAsNumber: true })}
              />
              {errors.baseDurationMinutes && (
                <p className="text-xs text-red-500">{errors.baseDurationMinutes.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Applicable For</Label>
            <Select
              value={applicableFor}
              onValueChange={(value) =>
                setValue('applicableFor', value as ServiceEditFormValues['applicableFor'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MENS">Mens</SelectItem>
                <SelectItem value="WOMENS">Womens</SelectItem>
                <SelectItem value="ALL">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea id="description" className="h-20 resize-none" {...register('description')} />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
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
