import { Vendor, VendorStatusCounts } from '@/features/vendors/types';

export type { Vendor, VendorStatusCounts };

export interface AssociationVendorListFilter {
  page?: number;
  limit?: number;
  status?: string;
  verificationStatus?: string;
  search?: string;
}

export interface AssociationVendorListResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: VendorStatusCounts;
}
