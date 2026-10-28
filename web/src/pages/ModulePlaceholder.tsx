import { ArrowLeft, ArrowRight, Construction, Sparkles } from 'lucide-react'
import type { NavKey } from '../types'

interface ModulePlaceholderProps {
  page: NavKey
  onBack: () => void
}

const moduleInfo: Record<Exclude<NavKey, 'dashboard'>, { title: string; eyebrow: string; description: string; items: string[]; phase: string }> = {
  anggota: {
    title: 'Data Anggota', eyebrow: 'MANAJEMEN ORGANISASI',
    description: 'Kelola profil anggota IRM Baitussalam, status keanggotaan, dan informasi kontak dalam satu tempat.',
    items: ['Daftar dan detail profil anggota', 'Tambah, ubah, dan hapus data anggota', 'Pencarian dan filter anggota'], phase: 'Tahap 2',
  },
  pengurus: {
    title: 'Data Pengurus', eyebrow: 'MANAJEMEN ORGANISASI',
    description: 'Susun struktur kepengurusan beserta jabatan dan hak akses setiap pengurus.',
    items: ['Daftar pengurus dan jabatan', 'Pengaturan role dan akses', 'Riwayat struktur kepengurusan'], phase: 'Tahap 3',
  },
  kegiatan: {
    title: 'Kegiatan & Absensi', eyebrow: 'AGENDA ORGANISASI',
    description: 'Buat jadwal kegiatan, tampilkan kode QR unik, dan siapkan alur pencatatan kehadiran anggota.',
    items: ['Kalender dan detail kegiatan', 'Pembuatan QR unik per kegiatan', 'Rekap absensi dan validasi agar tidak ganda'], phase: 'Tahap 4',
  },
  pengumuman: {
    title: 'Pengumuman', eyebrow: 'INFORMASI ORGANISASI',
    description: 'Publikasikan informasi organisasi agar anggota lebih mudah mengikuti agenda dan kabar terbaru.',
    items: ['Buat, ubah, dan hapus pengumuman', 'Daftar pengumuman terbaru', 'Tampilan pengumuman untuk anggota'], phase: 'Tahap 4',
  },
  keuangan: {
    title: 'Keuangan', eyebrow: 'TRANSPARANSI KAS',
    description: 'Catat pemasukan infak atau donasi dan pengeluaran kegiatan dengan riwayat yang jelas.',
    items: ['Pencatatan kas masuk dan kas keluar', 'Filter transaksi berdasarkan periode', 'Saldo dan riwayat transaksi'], phase: 'Tahap 5',
  },
  laporan: {
    title: 'Laporan', eyebrow: 'REKAPITULASI ORGANISASI',
    description: 'Tinjau rekap kegiatan dan keuangan bulanan sebelum laporan diverifikasi dan diekspor.',
    items: ['Rekap kegiatan dan kehadiran', 'Status verifikasi laporan keuangan', 'Ekspor laporan bulanan'], phase: 'Tahap 5',
  },
}

export default function ModulePlaceholder({ page, onBack }: ModulePlaceholderProps) {
  if (page === 'dashboard') return null
  const info = moduleInfo[page]
  return (
    <main className="module-placeholder-page">
      <button onClick={onBack} className="back-to-dashboard"><ArrowLeft size={16} /> Kembali ke dashboard</button>
      <div className="module-placeholder-card">
        <div className="module-placeholder-illustration"><div className="module-orbit" /><div className="module-building"><Construction size={33} /></div><span className="module-spark"><Sparkles size={18} /></span></div>
        <span className="eyebrow"><span className="eyebrow-dot" /> {info.eyebrow}</span>
        <h1>{info.title}</h1>
        <p className="module-placeholder-description">{info.description}</p>
        <div className="module-progress-label"><span>Rencana pengembangan</span><span>{info.phase}</span></div>
        <div className="module-progress-track"><span style={{ width: page === 'anggota' || page === 'kegiatan' ? '36%' : page === 'pengurus' || page === 'pengumuman' || page === 'keuangan' ? '18%' : '10%' }} /></div>
        <div className="module-planned-list">{info.items.map((item) => <div className="module-planned-item" key={item}><span className="planned-check"><Sparkles size={13} /></span>{item}</div>)}</div>
        <div className="module-placeholder-note"><Sparkles size={16} /><span>Halaman ini belum diimplementasikan. Kita akan mengerjakannya bertahap setelah fondasi dashboard selesai.</span></div>
        <button className="button-primary module-back-button" onClick={onBack}>Kembali ke dashboard <ArrowRight size={16} /></button>
      </div>
    </main>
  )
}
