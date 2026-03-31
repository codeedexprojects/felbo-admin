'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, Loader2, X, ImageIcon, AlertCircle } from 'lucide-react';
import { uploadBannerImage } from '@/features/advertisements/upload';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface BannerImageUploaderProps {
  value?: string;
  onChange: (key: string) => void;
  onClear: () => void;
  error?: string;
}

export function BannerImageUploader({ value, onChange, onClear, error }: BannerImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError('Only JPG, PNG, and WebP images are allowed.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError('File size must not exceed 10 MB.');
        return;
      }

      setIsUploading(true);
      setProgress(0);
      try {
        const url = await uploadBannerImage(file, setProgress);
        onChange(url);
      } catch (err) {
        setUploadError((err as Error)?.message || 'Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const previewSrc = value ?? null;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload banner image"
      />

      {value && previewSrc ? (
        <div className="relative rounded-xl overflow-hidden border border-border/60 bg-muted h-48 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Banner preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg bg-white/90 hover:bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors"
            >
              <Upload className="h-4 w-4" />
              Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-2 rounded-lg bg-red-500/90 hover:bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ) : isUploading ? (
        // ── Uploading state ────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/50 h-48 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="w-48 h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
        </div>
      ) : (
        // ── Drop zone ──────────────────────────────────────────────────
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed h-48 gap-3 cursor-pointer transition-colors select-none
            ${
              isDragging
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-border text-muted-foreground'
            }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}
          >
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs mt-0.5">JPG, PNG, WebP · max 10 MB</p>
          </div>
        </div>
      )}

      {/* Error messages */}
      {(uploadError || error) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{uploadError || error}</p>
        </div>
      )}
    </div>
  );
}
