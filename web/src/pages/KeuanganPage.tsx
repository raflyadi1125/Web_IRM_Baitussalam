import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import type { AppRole } from '../routes/types'
import {
  downloadCsv,
  FINANCE_STORAGE_KEY,
  formatIndonesianDate,
  formatRupiah,
  getLocalDateValue,
  getLocalMonthValue,
  readFinanceTransactions,
  type FinanceCategory,
  type FinanceDirection,
  type FinanceTransaction,
} from '../data/finance'

interface TransactionForm {
  date: string
  direction: FinanceDirection
  category: FinanceCategory
  description: string
  amount: string
  relatedActivity: string
}

const categories: FinanceCategory[] = ['Saldo Awal', 'Infak', 'Donasi', 'Iuran Anggota', 'Konsumsi', 'Perlengkapan', 'Transportasi', 'Sosial', 'Lainnya']
const incomeCategories: FinanceCategory[] = ['Saldo Awal', 'Infak', 'Donasi', 'Iuran Anggota', 'Lainnya']
const expenseCategories: FinanceCategory[] = ['Konsumsi', 'Perlengkapan', 'Transportasi', 'Sosial', 'Lainnya']
const emptyForm: TransactionForm = { date: getLocalDateValue(), direction: 'Masuk', category: 'Infak', description: '', amount: '', relatedActivity: '' }

export default function KeuanganPage({ role, searchQuery = '' }: { role: AppRole; searchQuery?: string }) {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(readFinanceTransactions)
  const [localSearch, setLocalSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonthValue())
  const [directionFilter, setDirectionFilter] = useState<'Semua arus' | FinanceDirection>('Semua arus')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null)
  const [form, setForm] = useState<TransactionForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const canManage = role === 'admin' || role === 'bendahara'
  const filteredTransactions = useMemo(() => {
    const query = `${searchQuery} ${localSearch}`.trim().toLocaleLowerCase('id-ID')
    return transactions.filter((item) => {
      const matchesMonth = !selectedMonth || item.date.startsWith(selectedMonth)
      const matchesDirection = directionFilter === 'Semua arus' || item.direction === directionFilter
      const matchesQuery = !query || [item.description, item.category, item.relatedActivity, item.createdBy].some((value) => value.toLocaleLowerCase('id-ID').includes(query))
      return matchesMonth && matchesDirection && matchesQuery
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  }, [transactions, selectedMonth, directionFilter, searchQuery, localSearch])

  useEffect(() => {
    try {
      window.localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(transactions))
    } catch {
      setNotice('Penyimpanan browser tidak tersedia. Perubahan hanya tersimpan selama halaman ini aktif.')
    }
  }, [transactions])

  const totalIncome = filteredTransactions.filter((item) => item.direction === 'Masuk').reduce((total, item) => total + item.amount, 0)
  const totalExpense = filteredTransactions.filter((item) => item.direction === 'Keluar').reduce((total, item) => total + item.amount, 0)
  const totalBalance = transactions.reduce((total, item) => total + (item.direction === 'Masuk' ? item.amount : -item.amount), 0)

  const openCreate = () => {
    setEditingTransaction(null)
    setForm({ ...emptyForm, date: getLocalDateValue() })
    setFormError('')
    setIsModalOpen(true)
  }

  const openEdit = (item: FinanceTransaction) => {
    setEditingTransaction(item)
    setForm({ date: item.date, direction: item.direction, category: item.category, description: item.description, amount: String(item.amount), relatedActivity: item.relatedActivity })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
    setFormError('')
  }

  const saveTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.date || !form.description.trim() || !Number.isFinite(amount) || amount <= 0) {
      setFormError('Tanggal, keterangan, dan nominal lebih dari nol wajib diisi.')
      return
    }
    if (form.direction === 'Masuk' && form.category === 'Konsumsi') {
      setFormError('Kategori konsumsi digunakan untuk kas keluar. Pilih kategori pemasukan yang sesuai.')
      return
    }
    const transaction: FinanceTransaction = {
      id: editingTransaction?.id ?? Math.max(0, ...transactions.map((item) => item.id)) + 1,
      date: form.date,
      direction: form.direction,
      category: form.category,
      description: form.description.trim(),
      amount: Math.round(amount),
      relatedActivity: form.relatedActivity.trim() || '—',
      createdBy: role === 'admin' ? 'Admin' : 'Bendahara',
    }
    setTransactions((current) => editingTransaction
      ? current.map((item) => item.id === editingTransaction.id ? transaction : item)
      : [transaction, ...current])
    setNotice(editingTransaction ? 'Transaksi berhasil diperbarui.' : 'Transaksi berhasil dicatat.')
    closeModal()
  }

  const deleteTransaction = (item: FinanceTransaction) => {
    if (!window.confirm(`Hapus transaksi “${item.description}” sebesar ${formatRupiah(item.amount)}?`)) return
    setTransactions((current) => current.filter((transaction) => transaction.id !== item.id))
    setNotice('Transaksi berhasil dihapus.')
  }

  const exportTransactions = () => {
    downloadCsv([
      ['Tanggal', 'Arus Kas', 'Kategori', 'Keterangan', 'Nominal', 'Kegiatan Terkait', 'Dicatat Oleh'],
      ...filteredTransactions.map((item) => [item.date, item.direction, item.category, item.description, item.amount, item.relatedActivity, item.createdBy]),
    ], `transaksi-irm-baitussalam-${selectedMonth || 'semua-periode'}.csv`)
  }

  const handleDirectionChange = (direction: FinanceDirection) => {
    setForm((current) => ({
      ...current,
      direction,
      category: direction === 'Masuk' ? (current.category === 'Saldo Awal' || current.category === 'Infak' || current.category === 'Donasi' || current.category === 'Iuran Anggota' ? current.category : 'Infak') : (current.category === 'Konsumsi' || current.category === 'Perlengkapan' || current.category === 'Transportasi' || current.category === 'Sosial' || current.category === 'Lainnya' ? current.category : 'Konsumsi'),
    }))
  }

  return (
    <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="flex items-center gap-2 text-[11px] font-bold tracking-[.16em] text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> TRANSPARANSI KAS</div><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Keuangan Organisasi</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Catat arus kas masuk dan keluar agar kondisi keuangan IRM Baitussalam mudah ditinjau.</p></div>
        <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={exportTransactions} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><ArrowDownToLine size={16} /> Ekspor CSV</button>{canManage && <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"><Plus size={16} /> Catat transaksi</button>}</div>
      </section>

      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Tutup pesan"><X size={16} /></button></div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceSummary icon={<Wallet size={20} />} label="Saldo kas saat ini" value={formatRupiah(totalBalance)} caption="Akumulasi semua transaksi contoh" tone="green" />
        <FinanceSummary icon={<TrendingUp size={20} />} label="Kas masuk · periode" value={formatRupiah(totalIncome)} caption="Pemasukan sesuai filter periode" tone="blue" />
        <FinanceSummary icon={<TrendingDown size={20} />} label="Kas keluar · periode" value={formatRupiah(totalExpense)} caption="Pengeluaran sesuai filter periode" tone="rose" />
        <FinanceSummary icon={<ClipboardList size={20} />} label="Transaksi ditampilkan" value={filteredTransactions.length.toLocaleString('id-ID')} caption={`${transactions.length} transaksi tersimpan di browser`} tone="amber" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-base font-bold text-slate-900">Ringkasan kas</h2><p className="mt-1 text-xs leading-5 text-slate-500">Perbandingan uang masuk dan keluar untuk filter periode yang dipilih.</p></div><label className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"><CalendarIcon /><input aria-label="Periode transaksi" type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="min-w-0 bg-transparent outline-none" /></label></div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-800"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-emerald-700"><ArrowDownLeft size={17} /></span> Total kas masuk</div><p className="mt-4 text-xl font-bold tracking-tight text-emerald-900">{formatRupiah(totalIncome)}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalIncome + totalExpense > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 0}%` }} /></div></div><div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-rose-800"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-rose-700"><ArrowUpRight size={17} /></span> Total kas keluar</div><p className="mt-4 text-xl font-bold tracking-tight text-rose-900">{formatRupiah(totalExpense)}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-rose-500" style={{ width: `${totalIncome + totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 0}%` }} /></div></div></div>
          <p className="mt-4 text-xs leading-5 text-slate-400">Netto periode ini: <strong className={totalIncome >= totalExpense ? 'text-emerald-700' : 'text-rose-700'}>{formatRupiah(totalIncome - totalExpense)}</strong>. Saldo kas menggunakan seluruh transaksi yang tersimpan, bukan hanya periode terpilih.</p>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck size={21} /></span><h2 className="mt-4 text-base font-bold text-slate-900">Pencatatan transparan</h2><p className="mt-2 text-sm leading-6 text-slate-500">Setiap transaksi sebaiknya memiliki tanggal, nominal, keterangan, serta kegiatan terkait bila ada.</p>
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4"><ChecklistLine label="Kas masuk" detail="Infak, donasi, dan iuran anggota" /><ChecklistLine label="Kas keluar" detail="Biaya konsumsi, perlengkapan, atau kegiatan" /><ChecklistLine label="Laporan" detail="Periksa rekap sebelum diajukan ke Admin" /></div>
          <div className="mt-5 rounded-xl bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800"><strong>Mode prototipe.</strong> Pencatatan ini belum tersinkron ke server dan belum menjadi bukti transaksi resmi.</div>
        </aside>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="text-base font-bold text-slate-900">Riwayat transaksi</h2><p className="mt-1 text-xs text-slate-500">Daftar pemasukan dan pengeluaran pada periode yang dipilih.</p></div><div className="flex flex-wrap gap-2"><label className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 sm:min-w-56"><Search size={15} /><input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Cari transaksi..." className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></label><select aria-label="Filter arus kas" value={directionFilter} onChange={(event) => setDirectionFilter(event.target.value as typeof directionFilter)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500"><option>Semua arus</option><option>Masuk</option><option>Keluar</option></select></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><th className="px-5 py-3 font-bold">Tanggal</th><th className="px-5 py-3 font-bold">Keterangan</th><th className="px-5 py-3 font-bold">Kategori</th><th className="px-5 py-3 font-bold">Kegiatan terkait</th><th className="px-5 py-3 text-right font-bold">Nominal</th>{canManage && <th className="px-5 py-3 text-right font-bold">Aksi</th>}</tr></thead><tbody className="divide-y divide-slate-100">{filteredTransactions.map((item) => <tr key={item.id} className="transition hover:bg-slate-50/70"><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatIndonesianDate(item.date)}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.direction === 'Masuk' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{item.direction === 'Masuk' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div><p className="max-w-[220px] truncate text-sm font-semibold text-slate-800">{item.description}</p><p className="mt-1 text-[11px] text-slate-400">Dicatat oleh {item.createdBy}</p></div></div></td><td className="px-5 py-4"><span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item.category}</span></td><td className="max-w-52 truncate px-5 py-4 text-xs text-slate-500">{item.relatedActivity || '—'}</td><td className={`whitespace-nowrap px-5 py-4 text-right text-sm font-bold ${item.direction === 'Masuk' ? 'text-emerald-700' : 'text-rose-700'}`}>{item.direction === 'Masuk' ? '+' : '−'}{formatRupiah(item.amount)}</td>{canManage && <td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => openEdit(item)} aria-label={`Edit transaksi ${item.description}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Edit3 size={15} /></button><button type="button" onClick={() => deleteTransaction(item)} aria-label={`Hapus transaksi ${item.description}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={15} /></button></div></td>}</tr>)}</tbody></table>{filteredTransactions.length === 0 && <div className="flex flex-col items-center px-5 py-14 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Search size={20} /></span><p className="mt-4 text-sm font-bold text-slate-800">Transaksi tidak ditemukan</p><p className="mt-1 text-xs text-slate-500">Sesuaikan periode atau kata pencarian.</p></div>}</div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-400"><span>Menampilkan {filteredTransactions.length} transaksi</span><span>Saldo akumulatif: <strong className="text-slate-700">{formatRupiah(totalBalance)}</strong></span></div>
      </section>

      <p className="flex items-start gap-2 text-xs leading-5 text-slate-400"><AlertCircleIcon /> Data awal dibuat sebagai contoh. Saldo, transaksi, dan laporan harus diverifikasi dengan catatan organisasi sebelum dipakai sebagai data resmi.</p>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}><section role="dialog" aria-modal="true" aria-labelledby="finance-modal-title" className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 id="finance-modal-title" className="text-lg font-bold text-slate-900">{editingTransaction ? 'Edit transaksi' : 'Catat transaksi baru'}</h2><p className="mt-1 text-sm text-slate-500">Masukkan informasi transaksi kas dengan benar.</p></div><button type="button" onClick={closeModal} aria-label="Tutup formulir" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button></div><form onSubmit={saveTransaction} className="space-y-4 p-5 sm:p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Arus kas *</span><select value={form.direction} onChange={(event) => handleDirectionChange(event.target.value as FinanceDirection)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-500"><option>Masuk</option><option>Keluar</option></select></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Kategori *</span><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as FinanceCategory }))} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-500">{categories.filter((category) => (form.direction === 'Masuk' ? incomeCategories : expenseCategories).includes(category)).map((category) => <option key={category}>{category}</option>)}</select></label></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal *</span><input required type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-500" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Nominal (Rp) *</span><input required type="number" min="1" step="1" inputMode="numeric" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Contoh: 150000" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-500" /></label></div><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Keterangan *</span><input required maxLength={140} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Contoh: Pembelian konsumsi pengajian" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-500" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Kegiatan terkait (opsional)</span><input maxLength={120} value={form.relatedActivity} onChange={(event) => setForm((current) => ({ ...current, relatedActivity: event.target.value }))} placeholder="Contoh: Pengajian rutin Kamis" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-500" /></label>{formError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{formError}</p>}<div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row"><button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"><CheckCircle2 size={16} /> {editingTransaction ? 'Simpan perubahan' : 'Simpan transaksi'}</button></div></form></section></div>}
    </main>
  )
}

function FinanceSummary({ icon, label, value, caption, tone }: { icon: ReactNode; label: string; value: string; caption: string; tone: 'green' | 'blue' | 'rose' | 'amber' }) {
  const tones = { green: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-700' }
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{value}</p></div><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span></div><p className="mt-3 text-[11px] leading-4 text-slate-400">{caption}</p></article>
}

function ChecklistLine({ label, detail }: { label: string; detail: string }) {
  return <div className="flex items-start gap-2.5"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={13} /></span><div><p className="text-xs font-semibold text-slate-700">{label}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{detail}</p></div></div>
}

function CalendarIcon() {
  return <span className="text-slate-400">▦</span>
}

function AlertCircleIcon() {
  return <span className="mt-0.5 inline-flex shrink-0 text-amber-500"><AlertCircle size={15} /></span>
}
