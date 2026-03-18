export interface ListBookingsFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface BookingListItem {
  id: string;
  bookingNumber: string;
  userPhone: string;
  shopName: string;
  barberName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalServiceAmount: number;
  advancePaid: number;
  remainingAmount: number;
  status: string;
  createdAt: string;
}

export interface ListBookingsResponse {
  bookings: BookingListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingServiceSnapshot {
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
}

export interface BookingCancellation {
  cancelledAt: string;
  cancelledBy: string;
  reason: string;
  refundAmount: number;
  refundCoins: number;
  refundType: string;
  refundStatus: string;
}

export interface BookingDetail {
  id: string;
  bookingNumber: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  shopId: string;
  shopName: string;
  barberId: string;
  barberName: string;
  barberSelectionType: string;
  date: string;
  startTime: string;
  endTime: string;
  totalDurationMinutes: number;
  services: BookingServiceSnapshot[];
  totalServiceAmount: number;
  advancePaid: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentId?: string;
  razorpayOrderId?: string;
  status: string;
  cancellation?: BookingCancellation;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
