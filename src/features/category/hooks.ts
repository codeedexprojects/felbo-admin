'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryUploadUrl,
  verifyCategoryUpload,
} from './api';
import { CreateCategoryInput, UpdateCategoryInput } from './types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useCategoryUploadUrl = () => {
  return useMutation({
    mutationFn: ({ mimeType, fileSizeBytes }: { mimeType: string; fileSizeBytes: number }) =>
      getCategoryUploadUrl(mimeType, fileSizeBytes),
  });
};

export const useVerifyCategoryUpload = () => {
  return useMutation({
    mutationFn: (key: string) => verifyCategoryUpload(key),
  });
};
