import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  HandCoins,
  MapPin,
  Megaphone,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import SectionHeading from '../components/SectionHeading'
import StatCard from '../components/StatCard'
import { activityData, attendanceWeekly, transactionData } from '../data/mockData'
import type { ActivityItem, NavKey } from '../types'
import { ROLE_META } from '../routes/config'
import type { AppRole } from '../routes/types'

interface DashboardProps {
  role: AppRole
  searchQuery: string
  onNavigate: (page: NavKey) => void
}

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(value)

export default function Dashboard({ role, searchQuery, onNavigate }: DashboardProps) {
  const roleName = ROLE_META[role].label
  const canViewFinance = role === 'admin' || role === 'bendahara'
  const quickActions = [
    ...(role === 'admin' ? [{ icon: Users, title: 'Data anggota', description: 'Kelola profil anggota', tone: 'mint', page: 'anggota' as NavKey }] : []),
    ...(['admin', 'sekretaris', 'anggota'].includes(role) ? [{ icon: CalendarPlus, title: 'Jadwal kegiatan', description: 'Lihat agenda dan absensi', tone: 'blue', page: 'kegiatan' as NavKey }] : []),
    ...(['admin', 'sekretaris', 'anggota'].includes(role) ? [{ icon: Megaphone, title: 'Pengumuman', description: 'Informasi terbaru organisasi', tone: 'purple', page: 'pengumuman' as NavKey }] : []),
    ...(canViewFinance ? [{ icon: HandCoins, title: 'Catat keuangan', description: 'Kas masuk dan keluar', tone: 'gold', page: 'keuangan' as NavKey }] : []),
    ...(['admin', 'sekretaris', 'bendahara'].includes(role) ? [{ icon: FileText, title: 'Laporan bulanan', description: 'Lihat ringkasan organisasi', tone: 'mint', page: 'laporan' as NavKey }] : []),
  ]
  const visibleActivities = useMemo(() => activityData.filter((activity) =>
    `${activity.title} ${activity.category} ${activity.location}`.toLowerCase().includes(searchQuery.toLowerCase()),
  ), [searchQuery])

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> RINGKASAN ORGANISASI</div>
          <h1>Selamat datang, {roleName} <span className="wave">👋</span></h1>
          <p className="welcome-description">{role === 'anggota' ? 'Temukan agenda dan informasi terbaru IRM Baitussalam.' : 'Pantau kegiatan dan perkembangan IRM Baitussalam dari satu tempat.'}</p>
        </div>
        <div className="welcome-actions">
          <span className="preview-pill"><span /> Data simulasi</span>
          {['admin', 'sekretaris'].includes(role) && <button className="button-primary" onClick={() => onNavigate('kegiatan')}><CalendarPlus size={17} /> Buat kegiatan</button>}
        </div>
      </section>

      <section className="community-banner">
        <div className="banner-copy">
          <span className="banner-kicker">IRM BAITUSSALAM · BERTUMBUH BERSAMA</span>
          <h2>Satu ruang untuk bergerak,<br /><span>berkarya, dan berbagi.</span></h2>
          <p>Kelola aktivitas organisasi dengan lebih rapi, terbuka, dan saling terhubung.</p>
          <button className="banner-link" onClick={() => onNavigate('kegiatan')}>Jelajahi kegiatan <ArrowRight size={16} /></button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" />
          <div className="banner-moon" />
          <div className="banner-mosque">
            <div className="mosque-dome" /><div className="mosque-minaret minaret-left" /><div className="mosque-minaret minaret-right" />
            <div className="mosque-building"><span className="mosque-door" /><span className="mosque-window window-one" /><span className="mosque-window window-two" /></div>
          </div>
          <span className="banner-star star-one">✦</span><span className="banner-star star-two">✧</span><span className="banner-star star-three">✦</span>
          <div className="banner-art-caption"><span className="caption-line" /><span>Aktif · Kolaboratif · Transparan</span></div>
        </div>
        <div className="banner-decoration decoration-one" /><div className="banner-decoration decoration-two" />
      </section>

      <section className="stats-grid grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Ringkasan statistik">
        <StatCard label="Total anggota" value="128" note="Anggota terdaftar" trend="8,2%" icon={Users} iconTone="mint" />
        <StatCard label="Kegiatan bulan ini" value="08" note="Termasuk kegiatan mendatang" trend="2 baru" icon={CalendarCheck} iconTone="blue" />
        {canViewFinance && <StatCard label="Saldo kas" value="Rp4,85 jt" note="Saldo dari transaksi contoh" icon={CircleDollarSign} iconTone="gold" />}
        <StatCard label="Kehadiran rata-rata" value="86%" note="Rekap contoh bulan ini" trend="4,5%" icon={CheckCircle2} iconTone="purple" />
      </section>

      <div className="dashboard-columns grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(270px,1fr)] xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,1fr)]">
        <div className="dashboard-main-column">
          <section className="panel activity-panel">
            <SectionHeading
              title="Kegiatan mendatang"
              subtitle="Agenda terdekat IRM Baitussalam"
              action={<button className="text-action" onClick={() => onNavigate('kegiatan')}>Lihat semua <ArrowRight size={15} /></button>}
            />
            <div className="activity-list">
              {visibleActivities.length > 0 ? visibleActivities.map((activity) => <ActivityRow key={activity.id} activity={activity} onOpen={() => onNavigate('kegiatan')} />) : (
                <div className="empty-state"><SearchEmpty /> <strong>Kegiatan tidak ditemukan</strong><span>Coba kata kunci lain.</span></div>
              )}
            </div>
            <div className="panel-footnote"><span className="footnote-dot" /> Jadwal pada halaman ini masih berupa data contoh.</div>
          </section>

          <section className="panel attendance-panel">
            <SectionHeading
              title="Aktivitas kehadiran"
              subtitle="Gambaran partisipasi selama sepekan"
              action={<button className="period-select" onClick={() => onNavigate(role === 'anggota' ? 'kegiatan' : 'laporan')}>{role === 'anggota' ? 'Lihat kegiatan' : '7 hari terakhir'} <ArrowRight size={14} /></button>}
            />
            <div className="chart-summary"><strong>86%</strong><span className="chart-change"><ArrowUpRight size={15} /> 4,5%</span><span className="chart-summary-muted">dibanding minggu lalu</span></div>
            <div className="chart-wrap" role="img" aria-label="Grafik batang partisipasi kehadiran selama tujuh hari. Data contoh.">
              <div className="chart-guides"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
              <div className="chart-bars">
                {attendanceWeekly.map(({ day, value }) => (
                  <div className="chart-bar-column" key={day}>
                    <div className="chart-bar-area"><div className={`chart-bar ${day === 'Sab' ? 'chart-bar-highlight' : ''}`} style={{ height: `${value}%` }}><span className="bar-tooltip">{value}%</span></div></div>
                    <span className="chart-day">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-legend"><span className="legend-swatch" /> Persentase kehadiran <span className="legend-caption">*Data simulasi</span></div>
          </section>
        </div>

        <div className="dashboard-side-column">
          <section className="panel quick-panel">
            <SectionHeading title="Akses cepat" subtitle="Yang sering dibutuhkan" />
            <div className="quick-actions">
              {quickActions.map((action) => (
                <QuickAction
                  key={action.page}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  tone={action.tone}
                  onClick={() => onNavigate(action.page)}
                />
              ))}
            </div>
          </section>

          {canViewFinance && <section className="panel finance-panel">
            <SectionHeading
              title="Ringkasan kas"
              subtitle="Transaksi terbaru"
              action={<button className="panel-icon-action" aria-label="Buka halaman keuangan" onClick={() => onNavigate('keuangan')}><ArrowRight size={17} /></button>}
            />
            <div className="finance-balance"><div><span className="balance-label">Saldo saat ini</span><strong>Rp4.850.000</strong></div><span className="balance-icon"><CircleDollarSign size={21} /></span></div>
            <div className="finance-transactions">
              {transactionData.slice(0, 3).map((transaction) => (
                <div className="transaction-row" key={transaction.id}>
                  <span className={`transaction-icon ${transaction.direction === 'in' ? 'transaction-in' : 'transaction-out'}`}>{transaction.direction === 'in' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
                  <div className="transaction-copy"><strong>{transaction.title}</strong><span>{transaction.dateLabel}</span></div>
                  <strong className={`transaction-amount ${transaction.direction === 'in' ? 'amount-in' : 'amount-out'}`}>{transaction.direction === 'in' ? '+' : '−'}{rupiah(transaction.amount).replace('Rp', 'Rp ')}</strong>
                </div>
              ))}
            </div>
            <button className="finance-view-all" onClick={() => onNavigate('keuangan')}>Lihat semua transaksi <ArrowRight size={15} /></button>
            <p className="finance-disclaimer">Data transaksi di atas hanya untuk pratinjau tampilan.</p>
          </section>}

          <section className="quote-card">
            <span className="quote-mark">“</span>
            <p>Hal kecil yang dikerjakan bersama bisa membawa perubahan besar.</p>
            <span className="quote-credit">SEMANGAT KOLABORASI IRM</span>
            <div className="quote-spark quote-spark-one">✦</div><div className="quote-spark quote-spark-two">✧</div>
          </section>
        </div>
      </div>
      <footer className="dashboard-footer"><span>© {new Date().getFullYear()} IRM Baitussalam</span><span>Prototipe frontend · Tampilan {roleName}</span></footer>
    </div>
  )
}

function ActivityRow({ activity, onOpen }: { activity: ActivityItem; onOpen: () => void }) {
  const categoryClass = activity.category.toLowerCase()
  return (
    <article className="activity-row">
      <div className="activity-date"><strong>{activity.dateLabel.split(',')[0].slice(0, 3)}</strong><span>{activity.dateLabel.split(',')[1]?.trim().split(' ')[0] ?? '—'}</span></div>
      <div className="activity-main"><div className="activity-title-row"><h3>{activity.title}</h3><span className={`category-tag category-${categoryClass}`}>{activity.category}</span></div><div className="activity-meta"><span><Clock3 size={13} /> {activity.time}</span><span><MapPin size={13} /> {activity.location}</span></div></div>
      <button className="activity-open" onClick={onOpen} aria-label={`Lihat ${activity.title}`} title="Lihat detail"><ArrowRight size={17} /></button>
    </article>
  )
}

function QuickAction({ icon: Icon, title, description, tone, onClick }: { icon: typeof Users; title: string; description: string; tone: string; onClick: () => void }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span className={`quick-icon quick-${tone}`}><Icon size={18} /></span>
      <span className="quick-copy"><strong>{title}</strong><small>{description}</small></span>
      <ArrowRight size={15} className="quick-arrow" />
    </button>
  )
}

function SearchEmpty() {
  return <span className="empty-search-icon"><SearchEmptyIcon /></span>
}

function SearchEmptyIcon() {
  return <span className="empty-search-symbol">⌕</span>
}
