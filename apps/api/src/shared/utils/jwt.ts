import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import type { Role } from '../constants/roles';

export interface TokenPayload {
  uid: number;
  role: Role;
  email: string;
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
