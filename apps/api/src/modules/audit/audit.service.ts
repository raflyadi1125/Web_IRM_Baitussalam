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
    await db.orm.public.LogAktivitas.create({ userId, aksi, entitas, entitasId, detail });
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
    const base = tx.orm.public.LogAktivitas.where(where);
    const items = await base
      .orderBy((a) => a.createdAt.desc())
      .limit(limit)
      .offset(skip)
      .include('user')
      .all();
    const { total } = await base.aggregate((a) => ({ total: a.count() }));
    return { items, total };
  });

  // Jangan kirim hash password ke klien: sisakan hanya data dasar pengguna.
  const safeItems = items.map(({ user, ...rest }) => ({
    ...rest,
    user: user ? { id: user.id, nama: user.nama, email: user.email, role: user.role } : null,
  }));

  return { items: safeItems, meta: buildMeta(page, limit, total) };
};