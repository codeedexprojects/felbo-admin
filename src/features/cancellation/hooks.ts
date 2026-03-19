'use client';

import { useQuery } from '@tanstack/react-query';
import { getCancellations, getCancellationDetail } from './api';
import { ListCancellationsFilter } from './types';

export const useCancellations = (filters: ListCancellationsFilter) => {
  return useQuery({
    queryKey: ['cancellations', filters],
    queryFn: () => getCancellations(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useCancellationDetail = (id: string) => {
  return useQuery({
    queryKey: ['cancellation', id],
    queryFn: () => getCancellationDetail(id),
    enabled: !!id,
  });
};
