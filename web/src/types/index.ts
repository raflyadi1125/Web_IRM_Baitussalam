export type NavKey =
  | 'dashboard'
  | 'anggota'
  | 'pengurus'
  | 'kegiatan'
  | 'pengumuman'
  | 'keuangan'
  | 'laporan'

export type ActivityCategory = 'Pengajian' | 'Sosial' | 'Organisasi' | 'Hadroh'

export interface ActivityItem {
  id: number
  title: string
  dateLabel: string
  time: string
  location: string
  category: ActivityCategory
  attendees?: string
}

export interface TransactionItem {
  id: number
  title: string
  description: string
  dateLabel: string
  amount: number
  direction: 'in' | 'out'
}
