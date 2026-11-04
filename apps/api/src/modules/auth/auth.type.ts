import type { Role } from '../../shared/constants/roles';

export interface AuthUser {
  id: number;
  nama: string;
  email: string;
  role: Role;
  aktif: boolean;
}
