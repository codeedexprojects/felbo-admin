import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { CategoryDto, CreateCategoryInput, UpdateCategoryInput } from './types';

export const getCategories = async (): Promise<CategoryDto[]> => {
  const response = await axios.get<ApiResponse<CategoryDto[]>>('/admin/categories');
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch categories');
  }
  return response.data.data;
};

export const createCategory = async (input: CreateCategoryInput): Promise<CategoryDto> => {
  const response = await axios.post<ApiResponse<CategoryDto>>('/admin/categories', input);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to create category');
  }
  return response.data.data;
};

export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryInput
): Promise<CategoryDto> => {
  const response = await axios.patch<ApiResponse<CategoryDto>>(
    `/admin/categories/${categoryId}`,
    input
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to update category');
  }
  return response.data.data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const response = await axios.delete<ApiResponse<void>>(`/admin/categories/${categoryId}`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to delete category');
  }
};

export const toggleCategoryStatus = async (
  categoryId: string,
  isActive: boolean
): Promise<CategoryDto> => {
  const response = await axios.patch<ApiResponse<CategoryDto>>(
    `/admin/categories/${categoryId}/toggle`,
    { isActive }
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to toggle category status');
  }
  return response.data.data;
};

export const getCategoryUploadUrl = async (
  mimeType: string,
  fileSizeBytes: number
): Promise<{ uploadUrl: string; key: string }> => {
  const response = await axios.post<ApiResponse<{ uploadUrl: string; key: string }>>(
    '/admin/categories/upload-url',
    { mimeType, fileSizeBytes }
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to get upload URL');
  }
  return response.data.data;
};

export const verifyCategoryUpload = async (key: string): Promise<{ viewUrl: string }> => {
  const response = await axios.post<ApiResponse<{ viewUrl: string }>>(
    '/admin/categories/verify-upload',
    { key }
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to verify upload');
  }
  return response.data.data;
};

export const uploadToS3 = async (url: string, file: File): Promise<void> => {
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
};
