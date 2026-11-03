import { Check, type LucideIcon } from 'lucide-react'
import './OptionCards.css'

export type OptionTone = 'emerald' | 'rose' | 'blue' | 'amber' | 'violet' | 'slate'

export interface OptionCardItem<T extends string = string> {
  value: T
  label: string
  description?: string
  icon: LucideIcon
  tone?: OptionTone
}

interface OptionCardsProps<T extends string> {
  /** Judul grup: tampil di atas kartu dan dibaca pembaca layar. */
  legend: string
  /** Nama grup radio. Harus unik dalam satu halaman. */
  name: string
  value: T
  options: readonly OptionCardItem<T>[]
  onChange: (value: T) => void
  /** Jumlah kolom pada layar >= 640px. Di layar kecil kartu otomatis menyesuaikan. */
  columns?: 1 | 2 | 3 | 4 | 5
  /** `tile`: ikon di atas, cocok untuk label pendek. `row`: ikon di kiri dengan deskripsi. */
  variant?: 'tile' | 'row'
  /** Tampilkan tanda bintang wajib di samping judul. */
  markRequired?: boolean
  /** Ukuran judul kecil (12px) agar sejajar dengan form yang memakai label `text-xs`. */
  compact?: boolean
  /** Teks bantuan di bawah kartu. */
  hint?: string
  className?: string
}

/**
 * Pengganti <select> untuk pilihan yang jumlahnya sedikit dan tetap.
 * Di balik layar berupa grup radio asli, jadi keyboard (tab dan tombol panah)
 * dan pembaca layar tetap berfungsi seperti form biasa.
 */
export default function OptionCards<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  columns = 3,
  variant = 'tile',
  markRequired = false,
  compact = false,
  hint,
  className = '',
}: OptionCardsProps<T>) {
  return (
    <fieldset className={`option-cards ${className}`.trim()} data-compact={compact}>
      <legend className="option-cards-legend">
        {legend}
        {markRequired && <span className="option-cards-required" aria-hidden="true"> *</span>}
      </legend>
      <div className="option-cards-grid" data-cols={columns} data-variant={variant}>
        {options.map(({ value: optionValue, label, description, icon: Icon, tone = 'slate' }) => {
          const selected = optionValue === value
          return (
            <label key={optionValue} className="option-card" data-tone={tone} data-selected={selected}>
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={selected}
                onChange={() => onChange(optionValue)}
                className="option-card-input"
              />
              <span className="option-card-icon" aria-hidden="true">
                <Icon size={variant === 'row' ? 20 : 18} />
              </span>
              <span className="option-card-copy">
                <span className="option-card-label">{label}</span>
                {description && <span className="option-card-desc">{description}</span>}
              </span>
              <span className="option-card-check" aria-hidden="true">
                <Check size={12} strokeWidth={3} />
              </span>
            </label>
          )
        })}
      </div>
      {hint && <p className="option-cards-hint">{hint}</p>}
    </fieldset>
  )
}