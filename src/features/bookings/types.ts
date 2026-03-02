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
