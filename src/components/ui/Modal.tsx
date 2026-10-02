import { useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface Props {
  title: string
  description?: string
  onClose: () => void
  /** Prevents closing (e.g. while submitting). */
  busy?: boolean
  children: ReactNode
  size?: 'md' | 'lg'
  role?: 'dialog' | 'alertdialog'
}

export function Modal({ title, description, onClose, busy, children, size = 'md', role = 'dialog' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const close = () => { if (!busy) onClose() }
  useFocusTrap(ref, true, close)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} aria-hidden />
      <div
        ref={ref}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift animate-fade-up sm:rounded-2xl ${size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-md'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 id={titleId} className="font-display text-3xl font-normal leading-tight">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          <button type="button" onClick={close} disabled={busy} aria-label="Close dialog" className="-mr-2 rounded-lg p-2 text-ink-soft hover:bg-cream-deep hover:text-ink disabled:opacity-50">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
