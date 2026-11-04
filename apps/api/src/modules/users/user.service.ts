import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { buildMeta } from '../../shared/utils/pagination';
import { hashPassword } from '../../shared/utils/password';
import { logAudit } from '../audit/audit.service';
import { userSelect } from './user.type';
import type { CreateUserInput, ListUserQuery, UpdateUserInput } from './user.validation';

export const list = async ({ search, role, page, limit }: ListUserQuery) => {
  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { nama: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: userSelect, skip: (page - 1) * limit, take: limit, orderBy: { nama: 'asc' } }),
    prisma.user.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return user;
};

export const create = async (input: CreateUserInput, actorId: number) => {
  const user = await prisma.user.create({
    data: { ...input, password: await hashPassword(input.password) },
    select: userSelect,
  });
  await logAudit(actorId, 'CREATE', 'User', user.id, { email: user.email, role: user.role });
  return user;
};

export const update = async (id: number, input: UpdateUserInput, actorId: number) => {
  const data = { ...input, ...(input.password ? { password: await hashPassword(input.password) } : {}) };
  const user = await prisma.user.update({ where: { id }, data, select: userSelect });
  await logAudit(actorId, 'UPDATE', 'User', id, { fields: Object.keys(input) });
  return user;
};

export const remove = async (id: number, actorId: number) => {
  if (id === actorId) throw new AppError('Tidak dapat menghapus akun sendiri', 400);
  await prisma.user.delete({ where: { id } });
  await logAudit(actorId, 'DELETE', 'User', id);
};
