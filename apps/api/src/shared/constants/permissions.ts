import type { Role } from './roles';

export const PERMISSIONS = {
  manageUsers: ['ADMIN'],
  manageKepengurusan: ['ADMIN', 'SEKRETARIS'],
  manageKegiatan: ['ADMIN', 'SEKRETARIS'],
  administrasi: ['ADMIN', 'SEKRETARIS'],
  keuangan: ['ADMIN', 'BENDAHARA'],
  viewAudit: ['ADMIN'],
} as const satisfies Record<string, readonly Role[]>;