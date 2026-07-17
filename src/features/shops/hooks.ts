'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPendingShops, getPendingShopDetails, approveShop, rejectShop } from './api';
import { PendingShopsFilter, PendingShopsResponse } from './types';

export const usePendingShopDetails = (shopId: string) => {
  return useQuery({
    queryKey: ['pending-shop-detail', shopId],
    queryFn: () => getPendingShopDetails(shopId),
    enabled: !!shopId,
  });
};

export const usePendingShops = (filters: PendingShopsFilter) => {
  return useQuery({
    queryKey: ['pending-shops', filters],
    queryFn: () => getPendingShops(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useApproveShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveShop,
    onMutate: async (shopId) => {
      await queryClient.cancelQueries({ queryKey: ['pending-shops'] });
      queryClient.setQueriesData(
        { queryKey: ['pending-shops'] },
        (oldData: PendingShopsResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            shops: oldData.shops.filter((s) => s.id !== shopId),
            total: oldData.total - 1,
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shops'] });
      queryClient.invalidateQueries({ queryKey: ['pending-shop-count'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shops'] });
      queryClient.invalidateQueries({ queryKey: ['pending-shop-count'] });
      toast.error('Failed to approve shop. Please try again.');
    },
  });
};

export const useRejectShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shopId, reason }: { shopId: string; reason: string }) =>
      rejectShop(shopId, reason),
    onMutate: async ({ shopId }) => {
      await queryClient.cancelQueries({ queryKey: ['pending-shops'] });
      queryClient.setQueriesData(
        { queryKey: ['pending-shops'] },
        (oldData: PendingShopsResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            shops: oldData.shops.filter((s) => s.id !== shopId),
            total: oldData.total - 1,
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shops'] });
      queryClient.invalidateQueries({ queryKey: ['pending-shop-count'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shops'] });
      queryClient.invalidateQueries({ queryKey: ['pending-shop-count'] });
      toast.error('Failed to reject shop. Please try again.');
    },
  });
};
