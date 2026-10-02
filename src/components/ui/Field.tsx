import type { ReactNode } from 'react'

interface Props {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
}

export const fieldLabelClass = 'mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft'

/** Shared label / hint / error wrapper for form controls. */
export function Field({ id, label, hint, error, optional, children }: Props) {
  return (
    <div>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
        {optional && <span className="ml-1.5 normal-case tracking-normal text-ink-mute">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-mute">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint && !error ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ')
  return ids || undefined
}
