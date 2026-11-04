import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { signToken } from '../../shared/utils/jwt';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import { logAudit } from '../audit/audit.service';
import type { LoginInput, RegisterInput } from './auth.validation';

const publicSelect = { id: true, nama: true, email: true, role: true, aktif: true } as const;

export const register = async (input: RegisterInput) => {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError('Email sudah terdaftar', 409);
  const user = await prisma.user.create({
    data: { ...input, password: await hashPassword(input.password), role: 'ANGGOTA' },
    select: publicSelect,
  });
  await logAudit(user.id, 'REGISTER', 'User', user.id);
  return { user, token: signToken({ uid: user.id, role: user.role, email: user.email }) };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await comparePassword(input.password, user.password))) {
    throw new AppError('Email atau password salah', 401);
  }
  if (!user.aktif) throw new AppError('Akun tidak aktif', 403);
  await logAudit(user.id, 'LOGIN', 'User', user.id);
  const { password: _pw, ...safe } = user;
  return { user: safe, token: signToken({ uid: user.id, role: user.role, email: user.email }) };
};

export const me = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicSelect });
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return user;
};
