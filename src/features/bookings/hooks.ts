'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getBookingDetail, processRefund, getBookingStats } from './api';
import { ListBookingsFilter, AdminBookingStatsFilter } from './types';

export const useAdminBookingStats = (filters: AdminBookingStatsFilter) => {
  return useQuery({
    queryKey: ['bookingStats', filters],
    queryFn: () => getBookingStats(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useBookings = (filters: ListBookingsFilter) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => getBookings(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useBookingDetail = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingDetail(id),
    enabled: !!id,
  });
};

export const useProcessRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => processRefund(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
