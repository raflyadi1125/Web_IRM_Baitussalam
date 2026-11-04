import type { Role } from './roles';

export const PERMISSIONS = {
  manageUsers: ['ADMIN'],
  manageKepengurusan: ['ADMIN', 'KETUA', 'SEKRETARIS'],
  manageKegiatan: ['ADMIN', 'KETUA', 'SEKRETARIS', 'PENGURUS'],
  administrasi: ['ADMIN', 'KETUA', 'SEKRETARIS'],
  keuangan: ['ADMIN', 'KETUA', 'BENDAHARA'],
  viewAudit: ['ADMIN', 'KETUA'],
} as const satisfies Record<string, readonly Role[]>;
