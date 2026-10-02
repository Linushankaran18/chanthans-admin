import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  /** Optional element (e.g. a show/hide button) placed inside the input's right edge. */
  trailing?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField({ label, hint, error, trailing, className = '', ...rest }, ref) {
  const id = useId()
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined}
          className={`input-field ${error ? '!border-danger' : ''} ${className}`}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-0.5 flex items-center">{trailing}</div>}
      </div>
      {hint && <p id={hintId} className="mt-1.5 text-xs text-ink-mute">{hint}</p>}
      {error && <p id={errId} className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
})
