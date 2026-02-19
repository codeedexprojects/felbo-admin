'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendors, verifyVendor, rejectVendor } from './api'; // Updated import
import { VendorListFilter, VendorListResponse } from './types';

export const useVendors = (filters: VendorListFilter) => {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => getVendors(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useVerifyVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyVendor,
    onMutate: async (vendorId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vendors'] });

      // Optimistically update caches
      queryClient.setQueriesData(
        { queryKey: ['vendors'] },
        (oldData: VendorListResponse | undefined) => {
          if (!oldData || !oldData.vendors) return oldData;
          return {
            ...oldData,
            vendors: oldData.vendors.filter((v) => v.id !== vendorId),
            total: oldData.total - 1,
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      alert('Failed to verify vendor. Please try again.');
    },
  });
};

export const useRejectVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectVendor(id, reason),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['vendors'] });
      queryClient.setQueriesData(
        { queryKey: ['vendors'] },
        (oldData: VendorListResponse | undefined) => {
          if (!oldData || !oldData.vendors) return oldData;
          return {
            ...oldData,
            vendors: oldData.vendors.filter((v) => v.id !== id),
            total: oldData.total - 1,
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      alert('Failed to reject vendor.');
    },
  });
};
