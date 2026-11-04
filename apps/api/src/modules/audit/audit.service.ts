import { Prisma } from 'database';
import { prisma } from '../../config/database';
import { buildMeta, getPagination } from '../../shared/utils/pagination';

export const logAudit = async (
  userId: number | undefined,
  aksi: string,
  entitas: string,
  entitasId?: number,
  detail?: Prisma.InputJsonValue,
) => {
  try {
    await prisma.auditLog.create({ data: { userId, aksi, entitas, entitasId, detail } });
  } catch (err) {
    console.error('Gagal mencatat audit', err);
  }
};

export const list = async (query: { entitas?: string; userId?: number; page?: number; limit?: number }) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    ...(query.entitas ? { entitas: query.entitas } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, nama: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};
