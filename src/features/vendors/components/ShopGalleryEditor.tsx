'use client';

import { useRef, useState, useCallback } from 'react';
import { Loader2, Plus, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';

import { uploadShopPhoto } from '../upload';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PHOTOS = 10;

export interface ShopGalleryEditorProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export function ShopGalleryEditor({ photos, onChange }: ShopGalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, and WebP images are allowed.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError('File size must not exceed 10 MB.');
        return;
      }
      if (photos.length >= MAX_PHOTOS) {
        setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
        return;
      }

      setIsUploading(true);
      setProgress(0);
      try {
        const url = await uploadShopPhoto(file, setProgress);
        onChange([...photos, url]);
      } catch (err) {
        setError((err as Error)?.message || 'Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [photos, onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const handleRemove = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload shop photo"
      />

      <div className="grid grid-cols-4 gap-2">
        {photos.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
          >
            <Image src={url} alt="Shop photo" fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS &&
          (isUploading ? (
            <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 bg-muted/40">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground">{progress}%</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 hover:border-border hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[10px]">Add</span>
            </button>
          ))}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {photos.length}/{MAX_PHOTOS} photos · JPG, PNG, WebP · max 10 MB each
      </p>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
