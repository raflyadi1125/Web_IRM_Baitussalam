import { prisma } from '../../config/database';
import { buildMeta } from '../../shared/utils/pagination';
import type { CreateFeedbackInput, ListFeedbackQuery } from './feedback.validation';

export const list = async ({ kegiatanId, page, limit }: ListFeedbackQuery) => {
  const where = kegiatanId ? { kegiatanId } : {};
  const [items, total] = await prisma.$transaction([
    prisma.feedback.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, nama: true } }, kegiatan: { select: { id: true, nama: true } } },
    }),
    prisma.feedback.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const create = (input: CreateFeedbackInput, userId: number) =>
  prisma.feedback.create({ data: { ...input, userId } });

export const remove = async (id: number) => {
  await prisma.feedback.delete({ where: { id } });
};
