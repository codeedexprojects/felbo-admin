export interface Vendor {
  id: string;
  phone: string;
  ownerName: string;
  email: string | null;
  registrationType?: 'ASSOCIATION' | 'INDEPENDENT' | 'UNKNOWN';
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  shopDetails?: {
    name: string;
    type: string;
    address: Record<string, unknown>; // Flexible type for now
  };
  documents?: {
    shopLicense?: string;
    ownerIdProof?: string;
  };
  associationIdProofUrl?: string;
  associationMemberId?: string;
  registrationPaymentOrderId?: string;
}

export interface VendorListResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VendorListFilter {
  page?: number;
  limit?: number;
  status?: string;
  verificationStatus?: string;
  search?: string;
}
