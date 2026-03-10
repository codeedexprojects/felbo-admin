import { uploadFile } from '@/lib/upload';

export async function uploadBannerImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  return uploadFile(file, '/admin/advertisements', onProgress);
}
