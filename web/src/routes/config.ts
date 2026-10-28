import {
  BarChart3,
  CalendarDays,
  HandCoins,
  LayoutDashboard,
  Megaphone,
  Users,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import type { NavKey } from '../types'
import type { AppRole, RoleMeta } from './types'

export const ROLE_META: Record<AppRole, RoleMeta> = {
  admin: { label: 'Admin', description: 'Administrator', initials: 'AD' },
  sekretaris: { label: 'Sekretaris', description: 'Administrasi organisasi', initials: 'SK' },
  bendahara: { label: 'Bendahara', description: 'Pengelola keuangan', initials: 'BD' },
  anggota: { label: 'Anggota', description: 'Anggota IRM', initials: 'AG' },
}

export const ROLE_PAGES: Record<AppRole, readonly NavKey[]> = {
  admin: ['dashboard', 'anggota', 'pengurus', 'kegiatan', 'pengumuman', 'keuangan', 'laporan'],
  sekretaris: ['dashboard', 'kegiatan', 'pengumuman', 'laporan'],
  bendahara: ['dashboard', 'keuangan', 'laporan'],
  anggota: ['dashboard', 'kegiatan', 'pengumuman'],
}

export const PAGE_LABELS: Record<NavKey, string> = {
  dashboard: 'Overview',
  anggota: 'Data Anggota',
  pengurus: 'Data Pengurus',
  kegiatan: 'Kegiatan & Absensi',
  pengumuman: 'Pengumuman',
  keuangan: 'Keuangan',
  laporan: 'Laporan',
}

export interface NavigationItem {
  key: NavKey
  label: string
  icon: LucideIcon
  section: 'utama' | 'keuangan'
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'utama' },
  { key: 'anggota', label: 'Data Anggota', icon: Users, section: 'utama' },
  { key: 'pengurus', label: 'Data Pengurus', icon: UserCog, section: 'utama' },
  { key: 'kegiatan', label: 'Kegiatan & Absensi', icon: CalendarDays, section: 'utama' },
  { key: 'pengumuman', label: 'Pengumuman', icon: Megaphone, section: 'utama' },
  { key: 'keuangan', label: 'Keuangan', icon: HandCoins, section: 'keuangan' },
  { key: 'laporan', label: 'Laporan', icon: BarChart3, section: 'keuangan' },
]

export function getNavigationForRole(role: AppRole): NavigationItem[] {
  const allowedPages = ROLE_PAGES[role]
  return NAVIGATION_ITEMS
    .filter((item) => allowedPages.includes(item.key))
    .map((item) => role === 'sekretaris' && item.key === 'laporan' ? { ...item, section: 'utama' as const } : item)
}

export function canRoleAccessPage(role: AppRole, page: NavKey): boolean {
  return ROLE_PAGES[role].includes(page)
}
