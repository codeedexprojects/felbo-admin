import { z } from 'zod';
import { Admin } from '@/types/api';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface LoginResponse {
  token: string;
  admin: Admin;
}
