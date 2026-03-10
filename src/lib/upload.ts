import axios from 'axios';
import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

interface VerifyUploadResponse {
  permanentUrl: string;
}

/**
 * Generic S3 upload utility.
 * 1. Gets a presigned PUT URL from the backend
 * 2. Uploads the file directly to S3 (plain axios — no auth headers)
 * 3. Verifies the upload and returns the permanent URL from the backend
 *
 * @param file     - File to upload
 * @param endpoint - API resource base path, e.g. '/admin/categories'
 * @param onProgress - Optional progress callback (0–100)
 */
export async function uploadFile(
  file: File,
  endpoint: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const { data: urlData } = await apiClient.post<ApiResponse<UploadUrlResponse>>(
    `${endpoint}/upload-url`,
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
      if (e.total) onProgress?.(15 + Math.round((e.loaded / e.total) * 70));
    },
  });

  onProgress?.(85);

  const { data: verifyData } = await apiClient.post<ApiResponse<VerifyUploadResponse>>(
    `${endpoint}/verify-upload`,
    { key }
  );

  if (!verifyData.success) {
    throw new Error(verifyData.error?.message ?? 'Upload verification failed');
  }

  onProgress?.(100);

  return verifyData.data.permanentUrl;
}
