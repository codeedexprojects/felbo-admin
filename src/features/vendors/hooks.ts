'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getVendors,
  getVendorDetail,
  verifyVendor,
  rejectVendor,
  getVerificationRequests,
  getVendorRequestDetail,
  getVendorBookings,
  getPendingShopCount,
  updateVendorProfile,
  updateShop,
  updateShopService,
  updateBarber,
} from './api';
import {
  VendorListFilter,
  VendorListResponse,
  VerificationRequestsFilter,
  VerificationRequestsResponse,
  UpdateVendorProfileInput,
  UpdateShopInput,
  UpdateServiceInput,
  UpdateBarberInput,
} from './types';
import { ListBookingsFilter } from '../bookings/types';

export const usePendingShopCount = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['pending-shop-count'],
    queryFn: getPendingShopCount,
    staleTime: 30_000,
    enabled: options?.enabled !== false,
  });
};

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

export const useVendorBookings = (vendorId: string, filters: ListBookingsFilter) => {
  return useQuery({
    queryKey: ['vendor-bookings', vendorId, filters],
    queryFn: () => getVendorBookings(vendorId, filters),
    enabled: !!vendorId,
    placeholderData: (previousData) => previousData,
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
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'super-admin'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'super-admin'] });
      toast.error('Failed to verify vendor. Please try again.');
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
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'super-admin'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'super-admin'] });
      toast.error('Failed to reject vendor. Please try again.');
    },
  });
};

export const useUpdateVendorProfile = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateVendorProfileInput) => updateVendorProfile(vendorId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-detail', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => {
      toast.error('Failed to update vendor profile. Please try again.');
    },
  });
};

export const useUpdateShop = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shopId, input }: { shopId: string; input: UpdateShopInput }) =>
      updateShop(vendorId, shopId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-detail', vendorId] });
    },
    onError: () => {
      toast.error('Failed to update shop. Please try again.');
    },
  });
};

export const useUpdateShopService = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shopId,
      serviceId,
      input,
    }: {
      shopId: string;
      serviceId: string;
      input: UpdateServiceInput;
    }) => updateShopService(vendorId, shopId, serviceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-detail', vendorId] });
    },
    onError: () => {
      toast.error('Failed to update service. Please try again.');
    },
  });
};

export const useUpdateBarber = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ barberId, input }: { barberId: string; input: UpdateBarberInput }) =>
      updateBarber(vendorId, barberId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-detail', vendorId] });
    },
    onError: () => {
      toast.error('Failed to update barber. Please try again.');
    },
  });
};
