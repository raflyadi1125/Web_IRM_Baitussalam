export const ROLES = ['ADMIN', 'SEKRETARIS', 'BENDAHARA', 'ANGGOTA'] as const;
export type Role = (typeof ROLES)[number];