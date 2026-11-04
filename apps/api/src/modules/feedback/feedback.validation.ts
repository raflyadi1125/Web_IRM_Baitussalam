import { z } from 'zod';

export const createFeedbackSchema = z.object({
  kegiatanId: z.coerce.number().int().positive().optional(),
  pesan: z.string().trim().min(3),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});
export const listFeedbackQuery = z.object({
  kegiatanId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuery>;
