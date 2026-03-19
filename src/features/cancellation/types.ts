export interface ListCancellationsFilter {
  page?: number;
  limit?: number;
  search?: string;
  cancelledBy?: 'USER' | 'VENDOR';
  startDate?: string;
  endDate?: string;
}

export interface CancellationListItem {
  id: string;
  bookingNumber: string;
  shopName: string;
  userPhone?: string;
  date: string;
  startTime: string;
  paymentMethod: string;
  advancePaid: number;
  status: string;
  cancelledBy: 'USER' | 'VENDOR';
  cancelledAt: string;
  reason: string;
  refundType: string;
  refundStatus: string;
  refundAmount: number;
  refundCoins: number;
  createdAt: string;
}

export interface ListCancellationsResponse {
  cancellations: CancellationListItem[];
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

export interface CancellationDetail {
  id: string;
  bookingNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  totalDurationMinutes: number;
  status: string;
  services: BookingServiceSnapshot[];
  totalServiceAmount: number;
  advancePaid: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentId?: string;
  cancellation: {
    cancelledAt: string;
    cancelledBy: 'USER' | 'VENDOR';
    reason: string;
    refundAmount: number;
    refundCoins: number;
    refundType: string;
    refundStatus: string;
  };
  user: {
    id: string;
    name: string;
    phone: string;
  };
  shop: {
    id: string;
    name: string;
    phone: string;
    address: {
      line1: string;
      line2?: string;
      area: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    } | null;
    photos: string[];
  };
  vendor: {
    id: string;
    ownerName: string;
    phone: string;
    email?: string;
  };
  barber: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    photo?: string;
  };
  createdAt: string;
}
