export interface ListBookingsFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  vendorId?: string;
}

export interface BookingUser {
  id: string;
  name: string;
  phone: string;
}

export interface BookingVendor {
  id: string;
  shopName: string;
}

export interface BookingListItem {
  id: string;
  bookingNumber: string;
  user: BookingUser;
  vendor: BookingVendor;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  date: string;
  time: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export interface BookingStatusCounts {
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface ListBookingsResponse {
  bookings: BookingListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: BookingStatusCounts;
}

export interface BookingService {
  name: string;
  price: number;
  duration: number;
  barberName: string;
}

export interface PaymentDetails {
  method: string;
  advanceAmount: number;
  shopAmount: number;
  totalAmount: number;
  status: string;
}

export interface RefundDetails {
  status: string;
  amount: number;
  reason?: string;
  processedAt?: string;
}

export interface BookingDetail {
  id: string;
  bookingNumber: string;
  user: BookingUser;
  vendor: BookingVendor;
  services: BookingService[];
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  date: string;
  time: string;
  payment: PaymentDetails;
  refund?: RefundDetails;
  createdAt: string;
}
