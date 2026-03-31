'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { uploadAvatarFile } from '@/features/avatars/api';
import { useAddAvatar } from '@/features/avatars/hooks';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB for avatars

export function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { mutateAsync: addAvatarToDb } = useAddAvatar();

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError('Only JPG, PNG, and WebP images are allowed.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError('File size must not exceed 5 MB.');
        return;
      }

      setIsUploading(true);
      setProgress(0);
      try {
        const key = await uploadAvatarFile(file, setProgress);
        await addAvatarToDb(key);
      } catch (err) {
        setUploadError((err as Error)?.message || 'Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [addAvatarToDb]
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

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload avatar image"
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/50 h-40 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="w-48 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">Uploading… {progress}%</p>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed h-40 gap-3 cursor-pointer transition-all select-none
            ${
              isDragging
                ? 'border-primary bg-primary/5 text-primary scale-[1.01]'
                : 'border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-border/80 text-muted-foreground hover:scale-[1.005]'
            }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isDragging ? 'bg-primary/20' : 'bg-muted group-hover:bg-muted/80'}`}
          >
            <Upload
              className={`h-5 w-5 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground/90">
              {isDragging ? 'Drop Image' : 'Add New Avatar'}
            </p>
            <p className="text-[11px] mt-1">Square images recommended · max 5MB</p>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-[11px] text-red-700 font-medium leading-tight">{uploadError}</p>
        </div>
      )}
    </div>
  );
}
