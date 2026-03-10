'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCategory, useUpdateCategory } from '../hooks';
import { CategoryDto } from '../types';
import { CategoryImageUpload } from './CategoryImageUpload';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  category?: CategoryDto | null;
}

export function CategoryFormDialog({ open, onClose, category }: CategoryFormDialogProps) {
  const dialogKey = open ? (category?.id ?? 'new') : 'closed';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <CategoryFormInner key={dialogKey} category={category} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryFormInner({
  category,
  onClose,
}: {
  category?: CategoryDto | null;
  onClose: () => void;
}) {
  const isEdit = !!category;

  const [name, setName] = useState(category?.name ?? '');
  const [image, setImage] = useState(category?.image ?? '');
  const [displayOrder, setDisplayOrder] = useState(String(category?.displayOrder ?? 0));
  const [isActive, setIsActive] = useState<string>(String(category?.isActive ?? true));
  const [error, setError] = useState('');

  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const isPending = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    if (!image.trim()) {
      setError('Image URL is required.');
      return;
    }

    try {
      if (isEdit && category) {
        await updateCategory({
          id: category.id,
          input: {
            name: name.trim(),
            image: image.trim(),
            displayOrder: parseInt(displayOrder, 10) || 0,
            isActive: isActive === 'true',
          },
        });
      } else {
        await createCategory({
          name: name.trim(),
          image: image.trim(),
          displayOrder: parseInt(displayOrder, 10) || 0,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            placeholder="e.g. Photography"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Category Image</Label>
          <CategoryImageUpload value={image} onChange={setImage} disabled={isPending} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-order">Display Order</Label>
          <Input
            id="cat-order"
            type="number"
            min={0}
            placeholder="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            disabled={isPending}
          />
        </div>

        {isEdit && (
          <div className="space-y-1.5">
            <Label htmlFor="cat-status">Status</Label>
            <Select value={isActive} onValueChange={setIsActive} disabled={isPending}>
              <SelectTrigger id="cat-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
