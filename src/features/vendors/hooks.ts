'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVendors,
  getVendorDetail,
  verifyVendor,
  rejectVendor,
  getVerificationRequests,
  getVendorRequestDetail,
} from './api';
import {
  VendorListFilter,
  VendorListResponse,
  VerificationRequestsFilter,
  VerificationRequestsResponse,
} from './types';

export const useVendorRequestDetail = (id: string) => {
  return useQuery({
    queryKey: ['vendor-request-detail', id],
    queryFn: () => getVendorRequestDetail(id),
    enabled: !!id,
  });
};

export const useVerificationRequests = (filters: VerificationRequestsFilter) => {
  return useQuery({
    queryKey: ['vendor-requests', filters],
    queryFn: () => getVerificationRequests(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useVendors = (filters: VendorListFilter) => {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => getVendors(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useVendorDetail = (id: string) => {
  return useQuery({
    queryKey: ['vendor-detail', id],
    queryFn: () => getVendorDetail(id),
    enabled: !!id,
  });
};

export const useVerifyVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyVendor,
    onMutate: async (vendorId) => {
      // Cancel both caches
      await queryClient.cancelQueries({ queryKey: ['vendors'] });
      await queryClient.cancelQueries({ queryKey: ['vendor-requests'] });

      // Optimistically remove from vendors cache
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

      // Optimistically remove from vendor-requests cache
      queryClient.setQueriesData(
        { queryKey: ['vendor-requests'] },
        (oldData: VerificationRequestsResponse | undefined) => {
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
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      alert('Failed to verify vendor. Please try again.');
    },
  });
};

export const useRejectVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectVendor(id, reason),
    onMutate: async ({ id }) => {
      // Cancel both caches
      await queryClient.cancelQueries({ queryKey: ['vendors'] });
      await queryClient.cancelQueries({ queryKey: ['vendor-requests'] });

      // Optimistically remove from vendors cache
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

      // Optimistically remove from vendor-requests cache
      queryClient.setQueriesData(
        { queryKey: ['vendor-requests'] },
        (oldData: VerificationRequestsResponse | undefined) => {
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
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      alert('Failed to reject vendor.');
    },
  });
};
