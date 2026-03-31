import { BookingListItem } from '../bookings/types';

export interface PendingShopCount {
  count: number;
}

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
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAYMENT_PENDING';
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

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface VendorStatusCounts {
  total: number;
  active: number;
  pendingVerification: number;
  suspended: number;
}

export interface VendorListItem {
  slNo: number;
  id: string;
  ownerName: string;
  phone: string;
  type: 'ASSOCIATION' | 'INDEPENDENT';
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAYMENT_PENDING';
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
  slNo: number;
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
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAYMENT_PENDING';
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
    isAvailable: boolean;
    photos: string[];
    workingHours?: WorkingHours;
    barbers: {
      id: string;
      name: string;
      phone: string;
      photo?: string;
      isAvailable: boolean;
      cancellationCount?: number;
      cancellationsThisWeek?: number;
      timing?: {
        presets: {
          id: string;
          name: string;
          workingHours: { start: string; end: string };
          breaks: Array<{ start: string; end: string; reason?: string }>;
        }[];
        todaySchedule: {
          isWorking: boolean;
          workingHours: { start: string; end: string } | null;
          breaks: Array<{ start: string; end: string; reason?: string }>;
        } | null;
      };
    }[];
    barberCount: number;
    services: {
      id: string;
      name: string;
      basePrice: number;
      baseDurationMinutes: number;
      description?: string;
    }[];
    serviceCount: number;
  }[];
  recentBookings: BookingListItem[];
}

export interface VendorRequestDetail {
  id: string;
  phone: string;
  email: string | null;
  ownerName: string;
  registrationType: 'ASSOCIATION' | 'INDEPENDENT';
  registrationDate: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAYMENT_PENDING';
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
    photos: string[];
  };
}

export interface VendorBookingListItem {
  id: string;
  bookingNumber: string;
  userName: string;
  shopName: string;
  barberName: string;
  date: string;
  startTime: string;
  status: string;
}

export interface VendorBookingListResponse {
  bookings: VendorBookingListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
