export const STATUS_KEGIATAN = ['DRAFT', 'DIJADWALKAN', 'BERLANGSUNG', 'SELESAI', 'DIBATALKAN'] as const;
export type StatusKegiatan = (typeof STATUS_KEGIATAN)[number];

export const KATEGORI_KEGIATAN = ['RUTIN', 'KAJIAN', 'SOSIAL', 'HARI_BESAR', 'RAPAT', 'LAINNYA'] as const;
export type KategoriKegiatan = (typeof KATEGORI_KEGIATAN)[number];