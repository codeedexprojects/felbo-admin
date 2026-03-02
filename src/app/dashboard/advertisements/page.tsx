'use client';

import React, { useState, useCallback, useRef, useEffect, CSSProperties } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  LayoutList,
  ImageIcon,
  Loader2,
  Search,
  Store,
  X,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';

import { useAds, useUpdateAd, useDeleteAd } from '@/features/advertisements/hooks';
import { Ad, UpdateAdInput } from '@/features/advertisements/types';
import { BannerImageUploader } from '@/features/advertisements/BannerImageUploader';
import { buildS3Url } from '@/features/advertisements/upload';
import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';

// ── Shop search types ─────────────────────────────────────────────────────────

interface ShopSearchResult {
  id: string;
  name: string;
  address: { area: string; city: string };
}

// ── Edit-only zod schema (all fields optional) ────────────────────────────────

const editAdSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().min(1, 'Subtitle is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  bannerImage: z.string().min(1, 'Banner image is required'),
  shopId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Please select a shop from the search results above'),
  priority: z.coerce.number().int().min(0).optional(),
});

type EditAdFormValues = z.infer<typeof editAdSchema>;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AdCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

// ── Ad Card ───────────────────────────────────────────────────────────────────

function AdCard({
  ad,
  onEdit,
  onDelete,
}: {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
}) {
  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Banner */}
      <div className="relative h-44 w-full bg-muted overflow-hidden">
        {ad.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buildS3Url(ad.bannerImage)}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <Badge className="text-[10px] bg-black/60 text-white border-none backdrop-blur-sm pointer-events-none">
            Priority: {ad.priority}
          </Badge>
        </div>

        <div className="absolute top-2 right-2">
          <Badge
            className={`text-[10px] border-none backdrop-blur-sm ${
              ad.isActive ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'
            }`}
          >
            {ad.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1.5 bg-white/90 hover:bg-white text-foreground"
            onClick={() => onEdit(ad)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 gap-1.5"
            onClick={() => onDelete(ad)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground truncate">{ad.title}</h3>
        <p className="text-xs font-medium text-primary truncate">{ad.subtitle}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>

        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(ad.createdAt), 'dd MMM yyyy')}
          </span>
          <a
            href={buildS3Url(ad.bannerImage)}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-primary/70 hover:text-primary flex items-center gap-0.5 transition-colors"
          >
            Image <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function ShopSearchField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (shopId: string, shopName: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ShopSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    setIsSearching(true);
    updateDropdownPosition();
    apiClient
      .get<ApiResponse<{ shops: ShopSearchResult[] }>>(
        `/public/shops/search?query=${encodeURIComponent(debouncedQuery)}&limit=8`
      )
      .then((r) => {
        if (r.data.success) {
          setResults(r.data.data.shops);
          setOpen(true);
        }
      })
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery, updateDropdownPosition]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (shop: ShopSearchResult) => {
    setSelectedName(shop.name);
    setQuery('');
    setResults([]);
    setOpen(false);
    onChange(shop.id, shop.name);
  };

  const handleClear = () => {
    setSelectedName('');
    setQuery('');
    setResults([]);
    onChange('', '');
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="text-xs font-medium text-muted-foreground">Shop</label>
      {value && selectedName ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
          <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="text-sm text-emerald-900 flex-1 truncate">{selectedName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder="Search shop by name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateDropdownPosition();
            }}
            className="h-9 pl-8 text-sm"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {open && results.length > 0 && (
            <div
              style={dropdownStyle}
              className="rounded-md border border-border bg-popover shadow-xl overflow-hidden"
            >
              {results.map((shop) => (
                <button
                  key={shop.id}
                  type="button"
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors border-b border-border/40 last:border-0"
                  onClick={() => handleSelect(shop)}
                >
                  <Store className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{shop.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {shop.address?.area}, {shop.address?.city}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {open && !isSearching && debouncedQuery && results.length === 0 && (
            <div
              style={dropdownStyle}
              className="rounded-md border border-border bg-popover px-3 py-4 text-center text-xs text-muted-foreground shadow-xl"
            >
              No shops found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function EditAdModal({ open, onClose, ad }: { open: boolean; onClose: () => void; ad: Ad | null }) {
  const updateAd = useUpdateAd(ad?.id || '');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditAdFormValues>({
    resolver: zodResolver(editAdSchema) as import('react-hook-form').Resolver<EditAdFormValues>,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedShopId = watch('shopId');

  useEffect(() => {
    if (ad) {
      reset({
        title: ad.title,
        subtitle: ad.subtitle,
        description: ad.description,
        bannerImage: ad.bannerImage,
        shopId: ad.shopId,
        priority: ad.priority,
      });
    }
  }, [ad, reset]);

  const onSubmit = (values: EditAdFormValues) => {
    const payload: UpdateAdInput = {
      title: values.title,
      subtitle: values.subtitle,
      description: values.description,
      bannerImage: values.bannerImage,
      shopId: values.shopId,
      priority: values.priority,
    };
    updateAd.mutate(payload, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Advertisement</DialogTitle>
          <DialogDescription>Update the details of this advertisement.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 py-2 overflow-y-auto flex-1 pr-1"
        >
          <ShopSearchField
            value={watchedShopId || ''}
            onChange={(id) => setValue('shopId', id, { shouldValidate: true })}
            error={errors.shopId?.message}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input {...register('title')} placeholder="Ad title" className="h-9 text-sm" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
            <Input {...register('subtitle')} placeholder="Short tagline" className="h-9 text-sm" />
            {errors.subtitle && <p className="text-xs text-red-500">{errors.subtitle.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Banner Image</label>
            <BannerImageUploader
              value={watch('bannerImage')}
              onChange={(key) => setValue('bannerImage', key, { shouldValidate: true })}
              onClear={() => setValue('bannerImage', '', { shouldValidate: true })}
              error={errors.bannerImage?.message}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <Input
              {...register('priority')}
              type="number"
              min={0}
              placeholder="0"
              className="h-9 text-sm"
            />
            {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
          </div>

          {updateAd.isError && (
            <p className="text-xs text-red-500">{(updateAd.error as Error)?.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={updateAd.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAd.isPending} className="gap-1.5">
              {updateAd.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdvertisementsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError } = useAds({ page, limit });
  const deleteAdMutation = useDeleteAd();

  const [editModal, setEditModal] = useState<{ open: boolean; ad: Ad | null }>({
    open: false,
    ad: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; ad: Ad | null }>({
    open: false,
    ad: null,
  });

  const handleConfirmDelete = () => {
    if (!deleteModal.ad) return;
    deleteAdMutation.mutate(deleteModal.ad.id, {
      onSuccess: () => {
        deleteAdMutation.reset();
        setDeleteModal({ open: false, ad: null });
        // If we just deleted the last ad on this page, go back one page
        if (data && data.ads.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
      },
    });
  };

  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advertisements"
        description="Manage promotional banners displayed in the app."
        action={
          <Button size="sm" className="gap-1.5 h-8 bg-primary hover:bg-primary/90" asChild>
            <Link href="/dashboard/advertisements/new">
              <Plus className="h-3.5 w-3.5" />
              New Ad
            </Link>
          </Button>
        }
      />

      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutList className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="inline-block h-3.5 w-32" />
            ) : total === 0 ? (
              'No advertisements'
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {rangeStart}–{rangeEnd}
                </span>{' '}
                of <span className="font-semibold text-foreground">{total}</span> advertisement
                {total !== 1 ? 's' : ''}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid */}
      {isError ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">
          Failed to load advertisements. Please refresh the page.
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <AdCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.ads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card p-16 text-center space-y-3">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No advertisements yet</p>
          <p className="text-xs text-muted-foreground/70">
            Click &quot;New Ad&quot; to create your first promotional banner.
          </p>
          <Button size="sm" className="gap-1.5 mt-2" asChild>
            <Link href="/dashboard/advertisements/new">
              <Plus className="h-3.5 w-3.5" /> New Ad
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              onEdit={(a) => setEditModal({ open: true, ad: a })}
              onDelete={(a) => {
                deleteAdMutation.reset();
                setDeleteModal({ open: true, ad: a });
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages || 1}
          {total > 0 && ` · ${total} advertisement${total !== 1 ? 's' : ''}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/60"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/60"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditAdModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, ad: null })}
        ad={editModal.ad}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(v) => {
          if (!v) {
            // Only allow closing when not pending; reset error on close
            if (!deleteAdMutation.isPending) {
              deleteAdMutation.reset();
              setDeleteModal({ open: false, ad: null });
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteModal.ad?.title}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Error message from API */}
          {deleteAdMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {(deleteAdMutation.error as Error)?.message || 'Failed to delete advertisement.'}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteAdMutation.isPending}
              onClick={() => {
                deleteAdMutation.reset();
                setDeleteModal({ open: false, ad: null });
              }}
            >
              Cancel
            </AlertDialogCancel>
            {/* Use a plain Button (not AlertDialogAction) to prevent auto-close on click */}
            <Button
              variant="destructive"
              disabled={deleteAdMutation.isPending}
              onClick={handleConfirmDelete}
              className="gap-1.5"
            >
              {deleteAdMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {deleteAdMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
