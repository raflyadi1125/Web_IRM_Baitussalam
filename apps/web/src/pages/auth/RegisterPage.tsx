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

export default function RegisterPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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

  // Token warna sesuai tema (sama dengan dashboard admin & halaman login)
  const c = isDark
    ? {
        page: 'bg-[#0c0f0b]',
        title: 'text-white',
        text: 'text-white/70',
        muted: 'text-white/45',
        label: 'text-white/80',
        icon: 'text-white/40',
        pill: 'border-lime-300/30 bg-lime-300/10 text-lime-300',
        input:
          'border-white/10 bg-white/[0.04] text-white placeholder:text-white/40 focus:border-lime-300/50 focus:ring-lime-300/30',
        inputError: 'border-red-400/50',
        eyeBtn: 'text-white/50 hover:bg-white/[0.08] hover:text-white',
        fieldError: 'text-red-300',
        alert: 'border-red-400/30 bg-red-400/10 text-red-300',
        success: 'border-lime-300/30 bg-lime-300/10 text-lime-300',
        link: 'text-lime-300',
        btn: 'bg-lime-300 text-[#10150c] shadow-[0_0_24px_rgba(190,242,100,0.25)] hover:bg-lime-200',
      }
    : {
        page: 'bg-slate-50',
        title: 'text-slate-900',
        text: 'text-slate-600',
        muted: 'text-slate-500',
        label: 'text-slate-700',
        icon: 'text-slate-400',
        pill: 'border-lime-300 bg-lime-100 text-lime-800',
        input:
          'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-lime-300/50',
        inputError: 'border-red-300',
        eyeBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        fieldError: 'text-red-700',
        alert: 'border-red-200 bg-red-50 text-red-800',
        success: 'border-lime-300 bg-lime-50 text-lime-800',
        link: 'text-lime-700',
        btn: 'bg-lime-400 text-[#10150c] shadow-sm hover:bg-lime-300',
      }

  const inputClass = (hasError: boolean) =>
    `h-11 w-full rounded-full border pl-11 pr-4 text-sm outline-none transition focus:ring-2 ${c.input} ${
      hasError ? c.inputError : ''
    }`

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
      aria-pressed={showPassword}
      className={`absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full ${c.eyeBtn}`}
    >
      {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
    </button>
  )

  const labelClass = `mb-1.5 block text-xs font-semibold ${c.label}`
  const iconClass = `pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${c.icon}`
  const errorClass = `mt-1.5 text-xs ${c.fieldError}`

  return (
    <div className={`app-shell ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <BrandPanel />

        <div className={`relative flex flex-col ${c.page}`}>
          <header className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-[#1d2a16] via-[#121a0e] to-[#0c0f0b] px-5 py-4 text-white lg:hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-lime-300/10 blur-3xl"
            />
            <BrandLogo className="relative h-10 w-10" />
            <div className="relative">
              <p className="text-sm font-bold leading-tight">IRM Baitussalam</p>
              <p className="text-[11px] text-white/60">Sistem Informasi</p>
            </div>
          </header>

          <div className="absolute right-4 top-4 z-10 lg:right-6 lg:top-6">
            <ThemeToggle />
          </div>

          <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-md">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${c.pill}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" /> DAFTAR AKUN
              </span>
              <h1 className={`mt-4 text-2xl font-semibold tracking-tight sm:text-3xl ${c.title}`}>
                Buat akun baru
              </h1>
              <p className={`mt-2 text-sm leading-6 ${c.text}`}>
                Akun baru terdaftar sebagai Anggota. Peran lain ditetapkan oleh admin.
              </p>

              {done ? (
                <div className="mt-6 space-y-4">
                  <div
                    role="status"
                    className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs leading-5 ${c.success}`}
                  >
                    <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                    <span>
                      Pendaftaran berhasil. Jika akun perlu persetujuan, tunggu konfirmasi admin sebelum masuk.
                    </span>
                  </div>
                  <Link
                    to="/"
                    className={`flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors ${c.btn}`}
                  >
                    Kembali ke halaman masuk
                  </Link>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="register-nama" className={labelClass}>
                      Nama lengkap
                    </label>
                    <div className="relative">
                      <UserRound size={16} aria-hidden="true" className={iconClass} />
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
                    {fieldErrors.nama && <p className={errorClass}>{fieldErrors.nama}</p>}
                  </div>

                  <div>
                    <label htmlFor="register-email" className={labelClass}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} aria-hidden="true" className={iconClass} />
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
                    {fieldErrors.email && <p className={errorClass}>{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="register-password" className={labelClass}>
                      Kata sandi
                    </label>
                    <div className="relative">
                      <Lock size={16} aria-hidden="true" className={iconClass} />
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={Boolean(fieldErrors.password)}
                        className={`${inputClass(Boolean(fieldErrors.password))} pr-12`}
                      />
                      {passwordToggle}
                    </div>
                    {fieldErrors.password && <p className={errorClass}>{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="register-confirm" className={labelClass}>
                      Ulangi kata sandi
                    </label>
                    <div className="relative">
                      <Lock size={16} aria-hidden="true" className={iconClass} />
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
                    {fieldErrors.confirm && <p className={errorClass}>{fieldErrors.confirm}</p>}
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs leading-5 ${c.alert}`}
                    >
                      <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${c.btn}`}
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

                  <p className={`text-center text-sm ${c.muted}`}>
                    Sudah punya akun?{' '}
                    <Link to="/" className={`font-medium hover:underline ${c.link}`}>
                      Masuk di sini
                    </Link>
                  </p>
                </form>
              )}

              <p className={`mt-8 text-center text-[11px] ${c.muted}`}>
                © {new Date().getFullYear()} IRM Baitussalam
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}