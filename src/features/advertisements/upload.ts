import axios from 'axios';
import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

interface VerifyUploadResponse {
  verified: true;
  viewUrl: string;
}

export async function uploadBannerImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const { data: urlData } = await apiClient.post<ApiResponse<UploadUrlResponse>>(
    '/admin/advertisements/upload-url',
    { mimeType: file.type, fileSizeBytes: file.size }
  );

  if (!urlData.success) {
    throw new Error(urlData.error?.message ?? 'Failed to get upload URL');
  }

  const { uploadUrl, key } = urlData.data;
  onProgress?.(15);

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => {
      if (e.total) {
        onProgress?.(15 + Math.round((e.loaded / e.total) * 70));
      }
    },
  });

  onProgress?.(85);

  const { data: verifyData } = await apiClient.post<ApiResponse<VerifyUploadResponse>>(
    '/admin/advertisements/verify-upload',
    { key }
  );

  if (!verifyData.success) {
    throw new Error(verifyData.error?.message ?? 'Upload verification failed');
  }

  onProgress?.(100);

  return buildS3Url(key);
}

export function buildS3Url(key: string): string {
  if (key.startsWith('http')) return key;
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET!;
  const region = process.env.NEXT_PUBLIC_AWS_REGION!;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
