import { useState } from 'react'
import Sidebar from '../components/SideBar'
import Topbar from '../components/TopBar'
import type { NavKey } from '../types'
import AdminRoutes from './admin'
import AnggotaRoutes from './anggota'
import BendaharaRoutes from './bendahara'
import { canRoleAccessPage, PAGE_LABELS } from './config'
import SekretarisRoutes from './sekretaris'
import type { AppRole, RoleRouteProps } from './types'

export default function AppRoutes() {
  const [activeRole, setActiveRole] = useState<AppRole>('admin')
  const [activePage, setActivePage] = useState<NavKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navigate = (page: NavKey) => {
    setActivePage(canRoleAccessPage(activeRole, page) ? page : 'dashboard')
    setSearchQuery('')
  }

  const changeRole = (role: AppRole) => {
    setActiveRole(role)
    setActivePage('dashboard')
    setSearchQuery('')
    setSidebarOpen(false)
  }

  const routeProps: RoleRouteProps = {
    activePage,
    searchQuery,
    onNavigate: navigate,
  }

  const renderRoleRoutes = () => {
    switch (activeRole) {
      case 'admin':
        return <AdminRoutes {...routeProps} />
      case 'sekretaris':
        return <SekretarisRoutes {...routeProps} />
      case 'bendahara':
        return <BendaharaRoutes {...routeProps} />
      case 'anggota':
        return <AnggotaRoutes {...routeProps} />
    }
  }

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        activeRole={activeRole}
        isOpen={sidebarOpen}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-content min-h-screen">
        <Topbar
          key={`${activeRole}-${activePage}`}
          activePageTitle={PAGE_LABELS[activePage]}
          activeRole={activeRole}
          onRoleChange={changeRole}
          onMenuClick={() => setSidebarOpen(true)}
          onSearch={setSearchQuery}
        />
        <div className="mobile-page-label">{PAGE_LABELS[activePage]}</div>
        {renderRoleRoutes()}
      </div>
    </div>
  )
}
