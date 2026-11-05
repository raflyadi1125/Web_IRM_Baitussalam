import { db } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { signToken } from '../../shared/utils/jwt';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import { logAudit } from '../audit/audit.service';
import type { LoginInput, RegisterInput } from './auth.validation';

const publicFields = ['id', 'nama', 'email', 'role', 'aktif'] as const;

export const register = async (input: RegisterInput) => {
  const exists = await db.orm.public.User.where({ email: input.email }).first();
  if (exists) throw new AppError('Email sudah terdaftar', 409);

  const user = await db.orm.public.User.select(...publicFields).create({
    ...input,
    password: await hashPassword(input.password),
    role: 'ANGGOTA',
  });

  await logAudit(user.id, 'REGISTER', 'User', user.id);
  return { user, token: signToken({ uid: user.id, role: user.role, email: user.email }) };
};

export const login = async (input: LoginInput) => {
  const user = await db.orm.public.User.where({ email: input.email }).first();
  if (!user || !(await comparePassword(input.password, user.password))) {
    throw new AppError('Email atau password salah', 401);
  }
  if (!user.aktif) throw new AppError('Akun tidak aktif', 403);

  await logAudit(user.id, 'LOGIN', 'User', user.id);
  const { password: _pw, ...safe } = user;
  return { user: safe, token: signToken({ uid: user.id, role: user.role, email: user.email }) };
};

export const me = async (userId: number) => {
  const user = await db.orm.public.User
    .where({ id: userId })
    .select(...publicFields)
    .first();
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return user;
};