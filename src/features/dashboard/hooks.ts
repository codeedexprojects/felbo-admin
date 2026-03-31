import { useQuery } from '@tanstack/react-query';
import {
  getSuperAdminDashboard,
  getAssociationAdminDashboard,
  getTopAssociationVendors,
} from './api';

export const useSuperAdminDashboard = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: getSuperAdminDashboard,
    enabled: options?.enabled !== false,
  });
};

export const useAssociationAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'association-admin'],
    queryFn: getAssociationAdminDashboard,
  });
};

export const useTopAssociationVendors = () => {
  return useQuery({
    queryKey: ['dashboard', 'association-top-vendors'],
    queryFn: getTopAssociationVendors,
  });
};
