import type { Role } from '../../shared/constants/roles';
import type { UserStatus } from '../users/user.type';

export interface AuthUser {
  id: number;
  nama: string;
  email: string;
  role: Role;
  status: UserStatus;
}