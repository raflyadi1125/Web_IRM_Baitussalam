import { z } from 'zod';
import { USER_ROLES, USER_STATUS } from './user.type';

export const createUserSchema = z.object({
  nama: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  role: z.enum(USER_ROLES).default('ANGGOTA'),
  status: z.enum(USER_STATUS).default('AKTIF'), // dibuat langsung oleh admin, jadi langsung aktif
});

export const updateUserSchema = z
  .object({
    nama: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
    role: z.enum(USER_ROLES),
    status: z.enum(USER_STATUS),
  })
  .partial();

export const listUserQuery = z.object({
  search: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUserQuery = z.infer<typeof listUserQuery>;