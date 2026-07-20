import { z } from 'zod';

const phoneSchema = z
  .string()
  .length(10, 'Enter a valid 10-digit mobile number')
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

export const vendorProfileSchema = z.object({
  ownerName: z.string().min(1, 'Owner name is required').max(100).optional(),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
});

export type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

const addressSchema = z.object({
  line1: z.string().min(1, 'Line 1 is required'),
  line2: z.string().optional(),
  area: z.string().min(1, 'Area is required'),
  city: z.string().min(1, 'City is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
});

export const shopEditSchema = z.object({
  name: z.string().min(1, 'Shop name is required').max(100).optional(),
  description: z.string().max(1000).optional(),
  shopType: z.enum(['MENS', 'WOMENS', 'UNISEX']).optional(),
  address: addressSchema.optional(),
  photos: z.array(z.string().url()).max(10).optional(),
});

export type ShopEditFormValues = z.infer<typeof shopEditSchema>;

export const serviceEditSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100).optional(),
  basePrice: z.number().positive('Price must be greater than 0').optional(),
  baseDurationMinutes: z.number().int().min(5).max(180).optional(),
  applicableFor: z.enum(['MENS', 'WOMENS', 'ALL']).optional(),
  description: z.string().max(500).optional(),
});

export type ServiceEditFormValues = z.infer<typeof serviceEditSchema>;

export const barberEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: phoneSchema.optional(),
});

export type BarberEditFormValues = z.infer<typeof barberEditSchema>;
