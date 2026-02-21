'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssociationVendors } from './api';
import { AssociationVendorListFilter } from './types';

export const useAssociationVendors = (filters: AssociationVendorListFilter) => {
  return useQuery({
    queryKey: ['association-vendors', filters],
    queryFn: () => getAssociationVendors(filters),
    placeholderData: (previousData) => previousData,
  });
};
