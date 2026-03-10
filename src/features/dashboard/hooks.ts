import { useQuery } from '@tanstack/react-query';
import { getSuperAdminDashboard, getAssociationAdminDashboard } from './api';

export const useSuperAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: getSuperAdminDashboard,
  });
};

export const useAssociationAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'association-admin'],
    queryFn: getAssociationAdminDashboard,
  });
};
