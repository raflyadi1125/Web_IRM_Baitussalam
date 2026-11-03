
import { Check, type LucideIcon } from 'lucide-react'
import '../index.css'

export type OptionTone =
  | 'emerald'
  | 'rose'
  | 'blue'
  | 'amber'
  | 'violet'
  | 'slate'

export interface OptionCardItem<T extends string = string> {
  value: T
  label: string
  description?: string
  icon: LucideIcon
  tone?: OptionTone
}

interface OptionCardsProps<T extends string> {
  legend: string
  name: string
  value: T
  options: readonly OptionCardItem<T>[]
  onChange: (value: T) => void
  columns?: 1 | 2 | 3 | 4 | 5
  variant?: 'tile' | 'row'
  markRequired?: boolean
  compact?: boolean
  hint?: string
  className?: string

  // Props tambahan untuk pilihan Lainnya
  otherValue?: T
  otherDescription?: string
  onOtherDescriptionChange?: (description: string) => void
}

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
  otherValue,
  otherDescription = '',
  onOtherDescriptionChange,
}: OptionCardsProps<T>) {
  const isOtherSelected =
    otherValue !== undefined && value === otherValue

  return (
    <fieldset
      className={`option-cards ${className}`.trim()}
      data-compact={compact}
    >
      <legend className="option-cards-legend">
        {legend}
        {markRequired && (
          <span
            className="option-cards-required"
            aria-hidden="true"
          >
            {' '}*
          </span>
        )}
      </legend>

      <div
        className="option-cards-grid"
        data-cols={columns}
        data-variant={variant}
      >
        {options.map(
          ({
            value: optionValue,
            label,
            description,
            icon: Icon,
            tone = 'slate',
          }) => {
            const selected = optionValue === value

            return (
              <label
                key={optionValue}
                className="option-card"
                data-tone={tone}
                data-selected={selected}
              >
                <input
                  type="radio"
                  name={name}
                  value={optionValue}
                  checked={selected}
                  onChange={() => onChange(optionValue)}
                  className="option-card-input"
                />

                <span
                  className="option-card-icon"
                  aria-hidden="true"
                >
                  <Icon size={variant === 'row' ? 20 : 18} />
                </span>

                <span className="option-card-copy">
                  <span className="option-card-label">
                    {label}
                  </span>

                  {description && (
                    <span className="option-card-desc">
                      {description}
                    </span>
                  )}
                </span>

                <span
                  className="option-card-check"
                  aria-hidden="true"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
              </label>
            )
          },
        )}
      </div>

      {isOtherSelected && (
        <div className="option-card-other">
          <label
            className="option-card-other-label"
            htmlFor={`${name}-other-description`}
          >
            Deskripsikan pilihan lainnya
            <span aria-hidden="true"> *</span>
          </label>

          <textarea
            id={`${name}-other-description`}
            className="option-card-other-textarea"
            value={otherDescription}
            onChange={(event) =>
              onOtherDescriptionChange?.(event.target.value)
            }
            placeholder="Tuliskan deskripsi pilihan Anda..."
            rows={3}
          />
        </div>
      )}

      {hint && (
        <p className="option-cards-hint">{hint}</p>
      )}
    </fieldset>
  )
}
