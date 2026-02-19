export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export type AdminRole = 'SUPER_ADMIN' | 'SUB_ADMIN' | 'ASSOCIATION_ADMIN';
export type AdminStatus = 'ACTIVE' | 'BLOCKED';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}
