import { uploadFile } from '@/lib/upload';

export async function uploadEventImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  return uploadFile(file, '/admin/events', onProgress);
}
