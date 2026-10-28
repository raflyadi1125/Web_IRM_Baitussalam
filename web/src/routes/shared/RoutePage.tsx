import AnggotaPage from '../../pages/AnggotaPages'
import Dashboard from '../../pages/Dashboard'
import KegiatanPage from '../../pages/KegiatanPage'
import ModulePlaceholder from '../../pages/ModulePlaceholder'
import PengurusPage from '../../pages/PengurusPage'
import type { NavKey } from '../../types'
import { ROLE_META } from '../config'
import type { AppRole, RoleRouteProps } from '../types'

interface RoutePageProps extends RoleRouteProps {
  role: AppRole
}

export default function RoutePage({ role, activePage, searchQuery, onNavigate }: RoutePageProps) {
  switch (activePage) {
    case 'dashboard':
      return <Dashboard searchQuery={searchQuery} onNavigate={onNavigate} role={role} />
    case 'anggota':
      return <AnggotaPage searchQuery={searchQuery} />
    case 'pengurus':
      return <PengurusPage searchQuery={searchQuery} />
    case 'kegiatan':
      return <KegiatanPage searchQuery={searchQuery} />
    default: {
      const placeholderPage: Exclude<NavKey, 'dashboard' | 'anggota' | 'pengurus' | 'kegiatan'> = activePage as Exclude<NavKey, 'dashboard' | 'anggota' | 'pengurus' | 'kegiatan'>
      return <ModulePlaceholder page={placeholderPage} onBack={() => onNavigate('dashboard')} />
    }
  }
}

export function RoleRouteFallback({ role, onNavigate }: Pick<RoutePageProps, 'role' | 'onNavigate'>) {
  return (
    <main className="module-placeholder-page">
      <div className="module-placeholder-card">
        <div className="eyebrow"><span className="eyebrow-dot" /> HAK AKSES</div>
        <h1>Halaman tidak tersedia</h1>
        <p className="module-placeholder-description">
          Role {ROLE_META[role].label} tidak memiliki akses ke halaman ini. Kembali ke dashboard untuk melihat menu yang tersedia.
        </p>
        <button className="button-primary module-back-button" onClick={() => onNavigate('dashboard')}>Kembali ke dashboard</button>
      </div>
    </main>
  )
}
