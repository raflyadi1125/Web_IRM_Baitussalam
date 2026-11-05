
import { useState, type LucideIcon } from 'react'
import { CheckCircle2, ChevronDown, ListFilter } from 'lucide-react'

export interface CardDropdownOption {
  value: string
  label: string
  description?: string
  icon?: LucideIcon
}

interface CardDropdownProps {
  label: string
  value: string
  options: readonly CardDropdownOption[]
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}

export default function CardDropdown({
  label,
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
}: CardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className={`relative ${isOpen ? 'z-[110]' : 'z-10'} w-full`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel ?? label}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 text-left text-sm transition ${
          isOpen
            ? 'border-emerald-400 ring-4 ring-emerald-50'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ListFilter size={15} className="shrink-0 text-slate-400" />
          <span className="truncate font-medium text-slate-700">
            {selectedOption?.label ?? placeholder ?? label}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label={`Tutup pilihan ${label}`}
            className="fixed inset-0 z-[90] cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="listbox"
            aria-label={`Pilihan ${label}`}
            className="absolute left-0 top-full z-[120] mt-2 max-h-80 w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/20"
          >
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pilih {label.toLowerCase()}
            </p>

            <div className="space-y-1">
              {options.map((option) => {
                const Icon = option.icon ?? ListFilter
                const isSelected = value === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-xs font-semibold ${
                          isSelected ? 'text-emerald-800' : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </span>

                      {option.description && (
                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          {option.description}
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-emerald-700"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
