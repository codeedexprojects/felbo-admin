'use client';

import { useQuery } from '@tanstack/react-query';
import { getBookings } from './api';
import { ListBookingsFilter } from './types';

export const useBookings = (filters: ListBookingsFilter) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => getBookings(filters),
    placeholderData: (previousData) => previousData,
  });
};
