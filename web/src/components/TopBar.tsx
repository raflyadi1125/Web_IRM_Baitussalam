import { Bell, ChevronDown, Menu, Moon, Search, Settings2, Sun } from 'lucide-react'
import { useState } from 'react'
import { ROLE_META } from '../routes/config'
import type { AppRole } from '../routes/types'

interface TopbarProps {
  activePageTitle: string
  activeRole: AppRole
  onRoleChange: (role: AppRole) => void
  onMenuClick: () => void
  onSearch: (value: string) => void
  theme: 'light' | 'dark'
  onThemeChange: () => void
}

export default function Topbar({ activePageTitle, activeRole, onRoleChange, onMenuClick, onSearch, theme, onThemeChange }: TopbarProps) {
  const [searchValue, setSearchValue] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const date = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-button lg:hidden" onClick={onMenuClick} aria-label="Buka menu"><Menu size={21} /></button>
        <div className="breadcrumb"><span>Ruang Pengurus</span><span className="breadcrumb-divider">/</span><strong>{activePageTitle}</strong></div>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{date}</span>
        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={onThemeChange}
          aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label={`Cari pada halaman ${activePageTitle}`}
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value)
              onSearch(event.target.value)
            }}
            placeholder={activePageTitle === 'Data Anggota' ? 'Cari anggota...' : 'Cari kegiatan...'}
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="notification-wrap">
          <button className={`icon-button notification-button ${showNotifications ? 'icon-button-active' : ''}`} aria-label="Notifikasi" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}>
            <Bell size={19} />
            <span className="notification-dot" />
          </button>
          {showNotifications && (
            <div className="notification-popover">
              <div className="popover-heading"><strong>Notifikasi</strong><span>2 baru</span></div>
              <div className="notification-item"><span className="notification-symbol mint"><CalendarDaysIcon /></span><div><strong>Pengajian rutin</strong><p>Jadwal berikutnya besok malam.</p><small>10 menit lalu</small></div></div>
              <div className="notification-item"><span className="notification-symbol gold"><Settings2 size={16} /></span><div><strong>Lengkapi data sistem</strong><p>Pastikan data anggota sudah diperbarui.</p><small>Hari ini</small></div></div>
            </div>
          )}
        </div>
        <button className="topbar-user" aria-label="Profil pengguna" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}>
          <span className="avatar avatar-topbar">{ROLE_META[activeRole].initials}</span>
          <span className="topbar-user-copy"><strong>{ROLE_META[activeRole].label}</strong><small>{ROLE_META[activeRole].description}</small></span>
          <ChevronDown size={15} className="user-chevron" />
        </button>
        {showProfile && (
          <div className="profile-popover">
            <div className="profile-popover-head">
              <span className="avatar avatar-topbar">{ROLE_META[activeRole].initials}</span>
              <div><strong>{ROLE_META[activeRole].label} IRM</strong><small>{ROLE_META[activeRole].description} · akun demo</small></div>
            </div>
            <label className="role-select-label" htmlFor="preview-role">Pratinjau tampilan berdasarkan role</label>
            <select
              id="preview-role"
              className="role-select"
              value={activeRole}
              onChange={(event) => onRoleChange(event.target.value as AppRole)}
            >
              {(Object.keys(ROLE_META) as AppRole[]).map((role) => (
                <option key={role} value={role}>{ROLE_META[role].label}</option>
              ))}
            </select>
            <p>Penggantian role ini hanya untuk pratinjau frontend. Autentikasi dan kontrol akses sebenarnya akan ditangani backend.</p>
          </div>
        )}
      </div>
    </header>
  )
}

function CalendarDaysIcon() {
  return <span className="calendar-mini">29</span>
}
