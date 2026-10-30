import { useEffect, useId, useRef } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface ConfirmDeleteDialogProps {
  title: string
  itemName: string
  description: string
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
}

/** A reusable in-app confirmation card for destructive actions. */
export default function ConfirmDeleteDialog({
  title,
  itemName,
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Ya, hapus',
}: ConfirmDeleteDialogProps) {
  const headingId = useId()
  const descriptionId = useId()
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)

  useEffect(() => {
    onCancelRef.current = onCancel
  }, [onCancel])

  useEffect(() => {
    cancelButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancelRef.current()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
            <AlertTriangle size={21} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">Konfirmasi penghapusan</p>
            <h2 id={headingId} className="mt-1 text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup konfirmasi"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p id={descriptionId} className="text-sm leading-6 text-slate-600">{description}</p>

          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/70 px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-600">Data yang akan dihapus</p>
            <div className="mt-1.5 flex items-start gap-2">
              <Trash2 size={15} className="mt-0.5 shrink-0 text-rose-500" />
              <p className="break-words text-sm font-semibold text-slate-800">{itemName}</p>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi.</p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
            >
              <Trash2 size={15} /> {confirmLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
