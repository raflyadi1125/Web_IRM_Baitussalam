import { db } from '../../config/database';
import { buildMeta } from '../../shared/utils/pagination';
import type { CreateFeedbackInput, ListFeedbackQuery } from './feedback.validation';

export const list = async ({ kegiatanId, page, limit }: ListFeedbackQuery) => {
  const where = kegiatanId ? { kegiatanId } : {};
  const [items, total] = await db.$transaction([
    db.feedback.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, nama: true } }, kegiatan: { select: { id: true, nama: true } } },
    }),
    db.feedback.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const create = (input: CreateFeedbackInput, userId: number) =>
  db.feedback.create({ data: { ...input, userId } });

export const remove = async (id: number) => {
  await db.feedback.delete({ where: { id } });
};
