import { all, and, db, or } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { buildMeta } from '../../shared/utils/pagination';
import { hashPassword } from '../../shared/utils/password';
import { logAudit } from '../audit/audit.service';
import type { CreateUserInput, ListUserQuery, UpdateUserInput } from './user.validation';

// Field yang boleh keluar ke klien (tanpa password).
const publicFields = ['id', 'nama', 'email', 'noHp', 'alamat', 'fotoUrl', 'role', 'status', 'createdAt'] as const;

const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`;

export const list = async ({ search, role, status, page, limit }: ListUserQuery) => {
  const base = db.orm.public.User.where((u) =>
    and(
      role ? u.role.eq(role) : all(),
      status ? u.status.eq(status) : all(),
      search ? or(u.nama.ilike(likePattern(search)), u.email.ilike(likePattern(search))) : all(),
    ),
  );

  const [items, { total }] = await Promise.all([
    base
      .select(...publicFields)
      .orderBy((u) => u.nama.asc())
      .limit(limit)
      .offset((page - 1) * limit)
      .all(),
    base.aggregate((agg) => ({ total: agg.count() })),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const user = await db.orm.public.User.where({ id })
    .select(...publicFields)
    .first();
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return user;
};

export const create = async (input: CreateUserInput, actorId: number) => {
  const exists = await db.orm.public.User.where({ email: input.email }).first();
  if (exists) throw new AppError('Email sudah terdaftar', 409);

  const created = await db.orm.public.User.create({
    ...input,
    password: await hashPassword(input.password),
  });
  const { password: _pw, ...user } = created;

  await logAudit(actorId, 'CREATE', 'User', user.id, { email: user.email, role: user.role });
  return user;
};

export const update = async (id: number, input: UpdateUserInput, actorId: number) => {
  if (Object.keys(input).length === 0) throw new AppError('Tidak ada data yang diubah', 400);

  const data = { ...input, ...(input.password ? { password: await hashPassword(input.password) } : {}) };
  const user = await db.orm.public.User.where({ id })
    .select(...publicFields)
    .update(data);
  if (!user) throw new AppError('User tidak ditemukan', 404);

  await logAudit(actorId, 'UPDATE', 'User', id, { fields: Object.keys(input) });
  return user;
};

export const remove = async (id: number, actorId: number) => {
  if (id === actorId) throw new AppError('Tidak dapat menghapus akun sendiri', 400);
  const removed = await db.orm.public.User.where({ id }).delete();
  if (!removed) throw new AppError('User tidak ditemukan', 404);
  await logAudit(actorId, 'DELETE', 'User', id);
};