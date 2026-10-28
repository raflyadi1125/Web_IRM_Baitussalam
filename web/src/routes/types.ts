import type { NavKey } from '../types'

export type AppRole = 'admin' | 'sekretaris' | 'bendahara' | 'anggota'

export interface RoleRouteProps {
  activePage: NavKey
  searchQuery: string
  onNavigate: (page: NavKey) => void
}

export interface RoleMeta {
  label: string
  description: string
  initials: string
}
