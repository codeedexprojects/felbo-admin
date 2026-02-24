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

export interface VendorListItem {
  id: string;
  ownerName: string;
  phone: string;
  type: 'ASSOCIATION' | 'INDEPENDENT';
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  registered: string;
}

export interface VendorListResponse {
  vendors: VendorListItem[];
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

export interface VerificationRequestItem {
  id: string;
  shopName: string | null;
  ownerName: string;
  phone: string;
  type: 'ASSOCIATION' | 'INDEPENDENT';
  submitted: string;
}

export interface VerificationRequestsResponse {
  vendors: VerificationRequestItem[];
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
  shops: {
    id: string;
    name: string;
    shopType: string;
    phone: string;
    address: AddressInput;
    rating: { average: number; count: number };
    onboardingStatus: string;
    status: string;
    isActive: boolean;
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
  }[];
  recentBookings: unknown[];
}

export interface VendorRequestDetail {
  id: string;
  phone: string;
  email: string | null;
  ownerName: string;
  registrationType: 'ASSOCIATION' | 'INDEPENDENT';
  registrationDate: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNote?: string;
  // Association-specific
  associationMemberId?: string;
  associationIdProofUrl?: string;
  // Independent-specific
  registrationPayment?: {
    amount: number;
    paymentId: string;
    paidAt: string;
  };
  documents?: {
    shopLicense?: string;
    ownerIdProof?: string;
  };
  shopDetails?: {
    name: string;
    type: string;
    address: AddressInput;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
}
