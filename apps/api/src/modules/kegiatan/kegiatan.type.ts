export const STATUS_KEGIATAN = ['DRAFT', 'BERJALAN', 'SELESAI', 'BATAL'] as const;
export type StatusKegiatan = (typeof STATUS_KEGIATAN)[number];
