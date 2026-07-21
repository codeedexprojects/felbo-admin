import { uploadFile } from '@/lib/upload';

export async function uploadShopPhoto(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  return uploadFile(file, '/admin/vendors/shops', onProgress);
}
