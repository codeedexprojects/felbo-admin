import apiClient from '@/lib/axios';
import axios from 'axios';
import { ApiResponse } from '@/types/api';
import { Avatar, ListAvatarsResponse } from './types';

export const getAvatars = async (): Promise<Avatar[]> => {
  const response = await apiClient.get<ApiResponse<ListAvatarsResponse>>('/admin/avatars');

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch avatars');
  }

  return response.data.data.avatars;
};

export const deleteAvatar = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/avatars/${id}`);

  // Some endpoints return 204 (no body), some return 200 {success: true}
  if (response.status !== 204 && response.data && response.data.success === false) {
    throw new Error(response.data.error?.message || 'Failed to delete avatar');
  }
};

export const addAvatar = async (key: string): Promise<Avatar> => {
  const response = await apiClient.post<ApiResponse<Avatar>>('/admin/avatars', { key });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to add avatar');
  }

  return response.data.data;
};

export async function uploadAvatarFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const endpoint = '/admin/avatars';

  // 1. Get upload URL
  const { data: urlData } = await apiClient.post<ApiResponse<{ uploadUrl: string; key: string }>>(
    `${endpoint}/upload-url`,
    { mimeType: file.type, fileSizeBytes: file.size }
  );

  if (!urlData.success) {
    throw new Error(urlData.error?.message ?? 'Failed to get upload URL');
  }

  const { uploadUrl, key } = urlData.data;
  onProgress?.(15);

  // 2. Upload to S3/Cloud Storage
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(15 + Math.round((e.loaded / e.total) * 70));
    },
  });

  onProgress?.(85);

  // 3. Verify upload
  const { data: verifyData } = await apiClient.post<ApiResponse<{ permanentUrl: string }>>(
    `${endpoint}/verify-upload`,
    { key }
  );

  if (!verifyData.success) {
    throw new Error(verifyData.error?.message ?? 'Upload verification failed');
  }

  onProgress?.(100);

  return key; // We need the key to add it to the DB
}
