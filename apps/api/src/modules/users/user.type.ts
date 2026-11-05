export const USER_STATUS = ['PENDING', 'AKTIF', 'NONAKTIF'] as const;
export type UserStatus = (typeof USER_STATUS)[number];

// Sama dengan enum Role di contract.prisma.
export const USER_ROLES = ['ADMIN', 'SEKRETARIS', 'BENDAHARA', 'ANGGOTA'] as const;