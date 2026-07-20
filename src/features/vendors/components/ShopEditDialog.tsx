'use client';

import { useEffect, useState } from 'react';
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

import { useUpdateShop } from '../hooks';
import { shopEditSchema, ShopEditFormValues } from '../schema';
import { AddressInput } from '../types';
import { ShopGalleryEditor } from './ShopGalleryEditor';

export interface ShopEditDialogProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  shopId: string;
  name: string;
  shopType: string;
  address: AddressInput;
  photos: string[];
}

export function ShopEditDialog({
  open,
  onClose,
  vendorId,
  shopId,
  name,
  shopType,
  address,
  photos: initialPhotos,
}: ShopEditDialogProps) {
  const mutation = useUpdateShop(vendorId);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<ShopEditFormValues>({
    resolver: zodResolver(shopEditSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name,
        shopType: shopType as ShopEditFormValues['shopType'],
        address,
      });
      setPhotos(initialPhotos);
    }
  }, [open, name, shopType, address, initialPhotos, reset]);

  const selectedShopType = watch('shopType');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: ShopEditFormValues) => {
    mutation.mutate(
      { shopId, input: { ...data, photos } },
      {
        onSuccess: handleClose,
        onError: (err) => setError('root', { message: err.message }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit Shop
          </DialogTitle>
          <DialogDescription>Update this shop&apos;s details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-sm">
              Shop Name
            </Label>
            <Input id="name" className="h-9" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Shop Type</Label>
            <Select
              value={selectedShopType}
              onValueChange={(value) =>
                setValue('shopType', value as ShopEditFormValues['shopType'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MENS">Mens</SelectItem>
                <SelectItem value="WOMENS">Womens</SelectItem>
                <SelectItem value="UNISEX">Unisex</SelectItem>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="address.line1" className="text-sm">
                Address Line 1
              </Label>
              <Input id="address.line1" className="h-9" {...register('address.line1')} />
              {errors.address?.line1 && (
                <p className="text-xs text-red-500">{errors.address.line1.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address.line2" className="text-sm">
                Address Line 2
              </Label>
              <Input id="address.line2" className="h-9" {...register('address.line2')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address.area" className="text-sm">
                Area
              </Label>
              <Input id="address.area" className="h-9" {...register('address.area')} />
              {errors.address?.area && (
                <p className="text-xs text-red-500">{errors.address.area.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address.city" className="text-sm">
                City
              </Label>
              <Input id="address.city" className="h-9" {...register('address.city')} />
              {errors.address?.city && (
                <p className="text-xs text-red-500">{errors.address.city.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address.district" className="text-sm">
                District
              </Label>
              <Input id="address.district" className="h-9" {...register('address.district')} />
              {errors.address?.district && (
                <p className="text-xs text-red-500">{errors.address.district.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address.state" className="text-sm">
                State
              </Label>
              <Input id="address.state" className="h-9" {...register('address.state')} />
              {errors.address?.state && (
                <p className="text-xs text-red-500">{errors.address.state.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address.pincode" className="text-sm">
                Pincode
              </Label>
              <Input id="address.pincode" className="h-9" {...register('address.pincode')} />
              {errors.address?.pincode && (
                <p className="text-xs text-red-500">{errors.address.pincode.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Shop Gallery</Label>
            <ShopGalleryEditor photos={photos} onChange={setPhotos} />
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
