export interface IShopAddress {
  line1: string;
  line2?: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface IShopLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface IWorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface PendingShopDetailsServiceDto {
  id: string;
  categoryId: string;
  name: string;
  basePrice: number;
  baseDurationMinutes: number;
  applicableFor: 'MEN' | 'WOMEN' | 'ALL';
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PendingShopDetailsBarberDto {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  isAvailable: boolean;
  serviceCount: number;
}

export interface PendingShopDetailsDto {
  id: string;
  name: string;
  shopType: 'MENS' | 'WOMENS' | 'UNISEX';
  phone: string;
  address: IShopAddress;
  location: IShopLocation;
  description: string;
  workingHours?: IWorkingHours;
  photos: string[];
  rating: {
    average: string;
    count: number;
  };
  createdAt: string;
  vendor: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  services: PendingShopDetailsServiceDto[];
  barbers: PendingShopDetailsBarberDto[];
}

export interface PendingApprovalShopDto {
  id: string;
  name: string;
  shopType: 'MENS' | 'WOMENS' | 'UNISEX';
  address: IShopAddress;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  createdAt: string;
}

export interface PendingShopsResponse {
  shops: PendingApprovalShopDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PendingShopsFilter {
  page?: number;
  limit?: number;
}
