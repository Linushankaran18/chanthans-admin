import { forwardRef, useId, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField({ label, hint, error, className = '', ...rest }, ref) {
  const id = useId()
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined}
        className={`min-h-[44px] w-full rounded-lg border bg-white px-3.5 text-base text-ink placeholder:text-stone-400 sm:text-sm ${error ? 'border-red-600' : 'border-stone-300'} ${className}`}
        {...rest}
      />
      {hint && <p id={hintId} className="mt-1.5 text-xs text-ink-mute">{hint}</p>}
      {error && <p id={errId} className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  )
})
