import { z } from 'zod';

export const registerSchema = z.object({
  nama: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
