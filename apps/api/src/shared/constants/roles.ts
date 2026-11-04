export const ROLES = ['ADMIN', 'KETUA', 'SEKRETARIS', 'BENDAHARA', 'PENGURUS', 'ANGGOTA'] as const;
export type Role = (typeof ROLES)[number];
