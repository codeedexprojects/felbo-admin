'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAds, getAdById, createAd, updateAd, deleteAd, searchShops } from './api';
import { ListAdsFilter, CreateAdInput, UpdateAdInput } from './types';

export const useAds = (filters: ListAdsFilter) => {
  return useQuery({
    queryKey: ['advertisements', filters],
    queryFn: () => getAds(filters),
    placeholderData: (prev) => prev,
  });
};

export const useAdById = (id: string) => {
  return useQuery({
    queryKey: ['advertisements', id],
    queryFn: () => getAdById(id),
    enabled: !!id,
  });
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAdInput) => createAd(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useUpdateAd = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdInput) => updateAd(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['advertisements', id] });
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useShopSearch = (query: string) => {
  return useQuery({
    queryKey: ['shop-search', query],
    queryFn: () => searchShops(query),
    enabled: query.trim().length > 0,
    placeholderData: [],
  });
};
