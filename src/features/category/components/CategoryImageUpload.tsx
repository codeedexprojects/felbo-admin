'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/lib/upload';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CategoryImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function CategoryImageUpload({ value, onChange, disabled }: CategoryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must not exceed 10MB.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const permanentUrl = await uploadFile(file, '/admin/categories');

      setPreview(permanentUrl);
      onChange(permanentUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload image. Please try again.';
      setError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2 px-3 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">Upload Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          'relative group aspect-video rounded-xl border-2 border-dashed border-border/60 overflow-hidden bg-muted/30 transition-all duration-300',
          !preview && 'hover:border-primary/50 hover:bg-muted/50 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => !preview && !disabled && fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image src={preview} alt="Category" fill className="object-cover" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            ) : (
              <Upload className="h-10 w-10 mb-2 opacity-50 transition-transform group-hover:-translate-y-1" />
            )}
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Click to upload category image'}
            </p>
            <p className="text-xs opacity-60">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
