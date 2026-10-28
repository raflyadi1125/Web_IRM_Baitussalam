import AnggotaPage from '../../pages/AnggotaPage'
import Dashboard from '../../pages/Dashboard'
import KegiatanPage from '../../pages/KegiatanPage'
import KeuanganPage from '../../pages/KeuanganPage'
import LaporanPage from '../../pages/LaporanPage'
import PengumumanPage from '../../pages/PengumunanPage'
import PengurusPage from '../../pages/PengurusPage'
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
    case 'pengumuman':
      return <PengumumanPage role={role} searchQuery={searchQuery} />
    case 'keuangan':
      return <KeuanganPage role={role} searchQuery={searchQuery} />
    case 'laporan':
      return <LaporanPage role={role} />
    default:
      return <RoleRouteFallback role={role} onNavigate={() => onNavigate('dashboard')} />
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
