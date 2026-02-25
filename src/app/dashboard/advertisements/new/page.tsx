'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Search, Store, X, ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCreateAd } from '@/features/advertisements/hooks';
import { CreateAdInput } from '@/features/advertisements/types';
import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';

interface ShopSearchResult {
  id: string;
  name: string;
  address: { area: string; city: string };
}

const adSchema = z.object({
  shopId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Please select a shop from the search results above'),
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().min(1, 'Subtitle is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  bannerImage: z.string().min(1, 'Banner image URL is required'),
  priority: z.coerce.number().int().min(0).optional(),
});

type AdFormValues = z.infer<typeof adSchema>;

function ShopSearchField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (shopId: string, shopName: string) => void;
  error?: string;
}) {
  const [query, setQuery] = React.useState('');
  const [selectedName, setSelectedName] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState<ShopSearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setIsSearching(true);
    apiClient
      .get<ApiResponse<{ shops: ShopSearchResult[] }>>(
        `/shops/search?query=${encodeURIComponent(debouncedQuery)}&limit=8`
      )
      .then((r) => {
        if (r.data.success) {
          setResults(r.data.data.shops);
          setOpen(true);
        }
      })
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    <div ref={containerRef} className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        Shop <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-muted-foreground">
        Search and select the shop this advertisement is for.
      </p>

      {value && selectedName ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
            <Store className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-900 truncate">{selectedName}</p>
            <p className="text-xs text-emerald-600 font-mono">{value}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 text-emerald-500 hover:text-emerald-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Type shop name to search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-11 text-sm"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {open && results.length > 0 && (
            <div className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
              {results.map((shop) => (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => handleSelect(shop)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 transition-colors border-b border-border/40 last:border-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
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
            <div className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-xl border border-border bg-popover px-4 py-5 text-center shadow-xl">
              <p className="text-sm text-muted-foreground">
                No shops found for &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function NewAdvertisementPage() {
  const router = useRouter();
  const createAd = useCreateAd();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdFormValues>({
    resolver: zodResolver(adSchema) as import('react-hook-form').Resolver<AdFormValues>,
    defaultValues: { priority: 0 },
  });

  const watchedShopId = watch('shopId');
  const watchedBannerImage = watch('bannerImage');

  const onSubmit = (values: AdFormValues) => {
    const payload: CreateAdInput = {
      title: values.title,
      subtitle: values.subtitle,
      description: values.description,
      bannerImage: values.bannerImage,
      shopId: values.shopId,
      priority: values.priority,
    };

    createAd.mutate(payload, {
      onSuccess: () => router.push('/dashboard/advertisements'),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/advertisements">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Advertisements
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">New Advertisement</h1>
        <p className="text-sm text-muted-foreground">
          Create a promotional banner to be displayed in the app.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Shop (first, most important) ── */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Store className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Select Shop</h2>
          </div>
          <ShopSearchField
            value={watchedShopId || ''}
            onChange={(id) => setValue('shopId', id, { shouldValidate: true })}
            error={errors.shopId?.message}
          />
        </div>

        {/* ── Ad Details ── */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Ad Details</h2>
          </div>

          <Field label="Title" required error={errors.title?.message}>
            <Input
              {...register('title')}
              placeholder="e.g. Summer Special Offer"
              className="h-10 text-sm"
            />
          </Field>

          <Field label="Subtitle" required error={errors.subtitle?.message}>
            <Input
              {...register('subtitle')}
              placeholder="e.g. Get 20% off all haircuts this weekend"
              className="h-10 text-sm"
            />
          </Field>

          <Field label="Description" required error={errors.description?.message}>
            <textarea
              {...register('description')}
              placeholder="Describe what this advertisement is about…"
              rows={4}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Field>

          <Field
            label="Banner Image URL"
            required
            hint="Paste a direct link to the banner image (JPG, PNG, WebP)."
            error={errors.bannerImage?.message}
          >
            <Input
              {...register('bannerImage')}
              placeholder="https://your-cdn.com/banner.jpg"
              className="h-10 text-sm font-mono"
            />
          </Field>

          {/* Live banner preview */}
          {watchedBannerImage && (
            <div className="rounded-xl overflow-hidden border border-border/60 bg-muted h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={watchedBannerImage}
                alt="Banner preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <Field
            label="Priority"
            hint="Higher number means it appears first. Default is 0."
            error={errors.priority?.message}
          >
            <div className="flex items-center gap-2">
              <Input
                {...register('priority')}
                type="number"
                min={0}
                placeholder="0"
                className="h-10 text-sm w-32"
              />
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Optional
              </Badge>
            </div>
          </Field>
        </div>

        {/* Error */}
        {createAd.isError && (
          <p className="text-sm text-red-500 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
            {(createAd.error as Error)?.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 justify-end border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/advertisements')}
            disabled={createAd.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createAd.isPending} className="gap-2 min-w-[120px]">
            {createAd.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createAd.isPending ? 'Creating…' : 'Create Ad'}
          </Button>
        </div>
      </form>
    </div>
  );
}
