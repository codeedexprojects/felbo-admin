import { ListBookingsFilter, ListBookingsResponse, BookingDetail, BookingListItem } from './types';

// Dummy Data Generator
const generateDummyBookings = (): BookingListItem[] => {
  return Array.from({ length: 15 }).map((_, i) => {
    const status = i % 3 === 0 ? 'COMPLETED' : i % 5 === 0 ? 'CANCELLED' : 'CONFIRMED';
    return {
      id: `bk-${i + 1}`,
      bookingNumber: `FLB${1000 + i}`,
      user: {
        id: `u-${i}`,
        name: `User Name ${i + 1}`,
        phone: `+91 90000 0000${i}`,
      },
      vendor: {
        id: `v-${i}`,
        shopName: `Quality Barbers ${i + 1}`,
      },
      status: status as 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
      date: new Date().toISOString(),
      time: `10:${(i * 15) % 60 === 0 ? '00' : (i * 15) % 60} AM`,
      totalAmount: 150 + i * 10,
      paidAmount: 10,
      paymentStatus: 'ADVANCE_PAID',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });
};

export const getBookings = async (filters: ListBookingsFilter): Promise<ListBookingsResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const allBookings = generateDummyBookings();

  // Basic filtering
  let filteredBookings = allBookings;
  if (filters.status && filters.status !== 'ALL') {
    filteredBookings = filteredBookings.filter((b) => b.status === filters.status);
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredBookings = filteredBookings.filter(
      (b) =>
        b.bookingNumber.toLowerCase().includes(searchLower) ||
        b.user.name.toLowerCase().includes(searchLower) ||
        b.vendor.shopName.toLowerCase().includes(searchLower)
    );
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filteredBookings.slice(start, end);

  return {
    bookings: paginated,
    total: filteredBookings.length,
    page,
    limit,
    totalPages: Math.ceil(filteredBookings.length / limit),
    counts: {
      total: allBookings.length,
      confirmed: allBookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: allBookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: allBookings.filter((b) => b.status === 'CANCELLED').length,
    },
  };
};

export const getBookingDetail = async (id: string): Promise<BookingDetail> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Find dummy base info
  const allBookings = generateDummyBookings();
  const base = allBookings.find((b) => b.id === id) || allBookings[0];

  return {
    id: base.id,
    bookingNumber: base.bookingNumber,
    user: base.user,
    vendor: base.vendor,
    services: [
      {
        name: 'Haircut',
        price: base.totalAmount - 50,
        duration: 30,
        barberName: 'John Doe',
      },
      {
        name: 'Beard Trim',
        price: 50,
        duration: 15,
        barberName: 'John Doe',
      },
    ],
    status: base.status,
    date: base.date,
    time: base.time,
    payment: {
      method: 'Online (Razorpay)',
      advanceAmount: 10,
      shopAmount: base.totalAmount - 10,
      totalAmount: base.totalAmount,
      status: 'ADVANCE_PAID',
    },
    refund:
      base.status === 'CANCELLED'
        ? {
            status: 'PROCESSED',
            amount: 10,
            reason: 'User requested cancellation',
            processedAt: new Date().toISOString(),
          }
        : undefined,
    createdAt: base.createdAt,
  };
};

export const processRefund = async (id: string, reason: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('Processing refund for', id, 'with reason:', reason);
  // Just simulate success
};
