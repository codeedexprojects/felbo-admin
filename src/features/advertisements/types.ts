export interface Ad {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  shopId: string;
  createdBy: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListAdsFilter {
  page: number;
  limit: number;
}

export interface ListAdsResponse {
  ads: Ad[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdInput {
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  shopId: string;
  priority?: number;
}

export interface UpdateAdInput {
  title?: string;
  subtitle?: string;
  description?: string;
  bannerImage?: string;
  shopId?: string;
  priority?: number;
}
