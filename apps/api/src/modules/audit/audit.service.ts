import { db } from '../../config/database';
import { buildMeta, getPagination } from '../../shared/utils/pagination';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export const logAudit = async (
  userId: number | undefined,
  aksi: string,
  entitas: string,
  entitasId?: number,
  detail?: JsonValue,
) => {
  try {
    await db.orm.public.AuditLog.create({ userId, aksi, entitas, entitasId, detail });
  } catch (err) {
    console.error('Gagal mencatat audit', err);
  }
};

export const list = async (query: {
  entitas?: string;
  userId?: number;
  page?: number;
  limit?: number;
}) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    ...(query.entitas ? { entitas: query.entitas } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
  };

  const { items, total } = await db.transaction(async (tx) => {
    const base = tx.orm.public.AuditLog.where(where);
    const items = await base
      .orderBy((a) => a.createdAt.desc())
      .take(limit)
      .skip(skip)
      .include('user')
      .all();
    const { total } = await base.aggregate((a) => ({ total: a.count() }));
    return { items, total };
  });

  return { items, meta: buildMeta(page, limit, total) };
};