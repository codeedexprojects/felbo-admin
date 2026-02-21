export interface AddressInput {
  line1: string;
  line2?: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

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
    address: AddressInput;
  };
  documents?: {
    shopLicense?: string;
    ownerIdProof?: string;
  };
  associationIdProofUrl?: string;
  associationMemberId?: string;
  registrationPaymentOrderId?: string;
}

export interface VendorStatusCounts {
  total: number;
  active: number;
  pendingVerification: number;
  suspended: number;
}

export interface VendorListResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: VendorStatusCounts;
}

export interface VendorListFilter {
  page?: number;
  limit?: number;
  status?: string;
  verificationStatus?: string;
  search?: string;
}

export interface VerificationRequestCounts {
  pending: number;
  association: number;
  independent: number;
}

export interface VerificationRequestsFilter {
  page?: number;
  limit?: number;
  search?: string;
}

export interface VerificationRequestsResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: VerificationRequestCounts;
}

export interface VendorAdminDetail {
  id: string;
  phone: string;
  email: string | null;
  ownerName: string;
  registrationType: 'ASSOCIATION' | 'INDEPENDENT';
  registrationDate: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNote?: string;
  verifiedAt?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  isBlocked: boolean;
  isFlagged: boolean;
  documents?: {
    shopLicense?: string;
    ownerIdProof?: string;
  };
  associationMemberId?: string;
  associationIdProofUrl?: string;
  cancellationCount: number;
  cancellationsThisWeek: number;
  shop: {
    id: string;
    name: string;
    shopType: string;
    phone: string;
    address: AddressInput;
    rating: { average: number; count: number };
    onboardingStatus: string;
    status: string;
    isActive: boolean;
  } | null;
  barbers: {
    id: string;
    name: string;
    phone: string;
    photo?: string;
    isActive: boolean;
  }[];
  barberCount: number;
  services: {
    id: string;
    name: string;
    basePrice: number;
    baseDuration: number;
    description?: string;
  }[];
  serviceCount: number;
  recentBookings: unknown[];
}
