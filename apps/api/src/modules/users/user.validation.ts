import { z } from 'zod';
import { ROLES } from '../../shared/constants/roles';

export const createUserSchema = z.object({
  nama: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  role: z.enum(ROLES).default('ANGGOTA'),
  aktif: z.boolean().default(true),
});

export const updateUserSchema = z
  .object({
    nama: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
    role: z.enum(ROLES),
    aktif: z.boolean(),
  })
  .partial();

export const listUserQuery = z.object({
  search: z.string().optional(),
  role: z.enum(ROLES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUserQuery = z.infer<typeof listUserQuery>;
