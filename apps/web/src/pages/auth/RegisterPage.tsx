import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Eye, EyeOff, LoaderCircle, Lock, Mail, UserPlus, UserRound } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import { useTheme } from '../../contexts/ThemeContext'
import { LoginError, register } from '../../services/auth'
import { BrandLogo, BrandPanel } from './LoginPage'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

interface FieldErrors {
  nama?: string
  email?: string
  password?: string
  confirm?: string
}

function validate(nama: string, email: string, password: string, confirm: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!nama.trim()) errors.nama = 'Nama lengkap wajib diisi.'
  if (!email.trim()) errors.email = 'Email wajib diisi.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Format email belum benar.'
  if (!password) errors.password = 'Kata sandi wajib diisi.'
  else if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`
  if (!confirm) errors.confirm = 'Ulangi kata sandi Anda.'
  else if (confirm !== password) errors.confirm = 'Konfirmasi kata sandi tidak sama.'
  return errors
}

const inputClass = (hasError: boolean) =>
  `h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-emerald-800 ${
    hasError ? 'border-red-300' : 'border-slate-200'
  }`

export default function RegisterPage() {
  const { theme } = useTheme()
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const nextFieldErrors = validate(nama, email, password, confirm)
    setFieldErrors(nextFieldErrors)
    setError('')
    if (Object.keys(nextFieldErrors).length > 0) return

    setSubmitting(true)
    try {
      await register({ nama, email, password })
      setDone(true)
    } catch (caught) {
      setError(caught instanceof LoginError ? caught.message : 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
      aria-pressed={showPassword}
      className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    >
      {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
    </button>
  )

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <BrandPanel />

        <div className="relative flex flex-col">
          <header className="flex items-center gap-3 bg-linear-to-br from-[#14342a] to-[#2f6857] px-5 py-4 text-white lg:hidden">
            <BrandLogo className="h-10 w-10" />
            <div>
              <p className="text-sm font-bold leading-tight">IRM Baitussalam</p>
              <p className="text-[11px] text-emerald-100/80">Sistem Informasi</p>
            </div>
          </header>

          <div className="absolute right-4 top-4 z-10 lg:right-6 lg:top-6">
            <ThemeToggle />
          </div>

          <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-md">
              <div className="eyebrow">
                <span className="eyebrow-dot" /> DAFTAR AKUN
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Buat akun baru</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Akun baru terdaftar sebagai Anggota. Peran lain ditetapkan oleh admin.
              </p>

              {done ? (
                <div className="mt-6 space-y-4">
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800"
                  >
                    <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                    <span>
                      Pendaftaran berhasil. Jika akun perlu persetujuan, tunggu konfirmasi admin sebelum masuk.
                    </span>
                  </div>
                  <Link
                    to="/"
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald-800 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
                  >
                    Kembali ke halaman masuk
                  </Link>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="register-nama" className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Nama lengkap
                    </label>
                    <div className="relative">
                      <UserRound
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="register-nama"
                        type="text"
                        autoComplete="name"
                        placeholder="Nama lengkap Anda"
                        value={nama}
                        onChange={(event) => setNama(event.target.value)}
                        aria-invalid={Boolean(fieldErrors.nama)}
                        className={inputClass(Boolean(fieldErrors.nama))}
                      />
                    </div>
                    {fieldErrors.nama && <p className="mt-1.5 text-xs text-red-700">{fieldErrors.nama}</p>}
                  </div>

                  <div>
                    <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="register-email"
                        type="email"
                        autoComplete="username"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        aria-invalid={Boolean(fieldErrors.email)}
                        className={inputClass(Boolean(fieldErrors.email))}
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1.5 text-xs text-red-700">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Kata sandi
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={Boolean(fieldErrors.password)}
                        className={`${inputClass(Boolean(fieldErrors.password))} pr-11`}
                      />
                      {passwordToggle}
                    </div>
                    {fieldErrors.password && <p className="mt-1.5 text-xs text-red-700">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="register-confirm" className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Ulangi kata sandi
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="register-confirm"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Ketik ulang kata sandi"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        aria-invalid={Boolean(fieldErrors.confirm)}
                        className={inputClass(Boolean(fieldErrors.confirm))}
                      />
                    </div>
                    {fieldErrors.confirm && <p className="mt-1.5 text-xs text-red-700">{fieldErrors.confirm}</p>}
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-800"
                    >
                      <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle size={17} aria-hidden="true" className="animate-spin" /> Memproses...
                      </>
                    ) : (
                      <>
                        <UserPlus size={17} aria-hidden="true" /> Daftar
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Sudah punya akun?{' '}
                    <Link to="/" className="font-medium text-emerald-800 hover:underline">
                      Masuk di sini
                    </Link>
                  </p>
                </form>
              )}

              <p className="mt-8 text-center text-[11px] text-slate-500">
                © {new Date().getFullYear()} IRM Baitussalam
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}