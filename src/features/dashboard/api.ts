import axios from '@/lib/axios';
import {
  SuperAdminDashboardData,
  AssociationAdminDashboardData,
  TopAssociationVendor,
} from './types';
import { ApiResponse } from '@/types/api';

export const getSuperAdminDashboard = async (): Promise<SuperAdminDashboardData> => {
  const response = await axios.get<ApiResponse<SuperAdminDashboardData>>('/admin/dashboard');
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch dashboard data');
  }
  return response.data.data;
};

export const getAssociationAdminDashboard = async (): Promise<AssociationAdminDashboardData> => {
  const response = await axios.get<ApiResponse<AssociationAdminDashboardData>>(
    '/admin/dashboard/association'
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch association dashboard data');
  }
  return response.data.data;
};

export const getTopAssociationVendors = async (): Promise<TopAssociationVendor[]> => {
  const response = await axios.get<ApiResponse<TopAssociationVendor[]>>(
    '/admin/dashboard/association/top-vendors'
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch top vendors');
  }
  return response.data.data;
};
