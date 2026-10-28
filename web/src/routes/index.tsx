import { useEffect, useState } from 'react'
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = window.localStorage.getItem('irm-baitussalam:theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    window.localStorage.setItem('irm-baitussalam:theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

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
    <div className={`app-shell min-h-screen ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
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
          theme={theme}
          onThemeChange={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        />
        <div className="mobile-page-label">{PAGE_LABELS[activePage]}</div>
        {renderRoleRoutes()}
      </div>
    </div>
  )
}
