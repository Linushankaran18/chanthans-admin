import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { Field, describedBy } from './Field'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  /** Hide the visible label (still announced to screen readers). */
  hideLabel?: boolean
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, hint, error, optional, hideLabel, className = '', children, ...rest },
  ref,
) {
  const id = useId()
  const control = (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`input-field cursor-pointer appearance-none pr-10 ${error ? '!border-danger' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" aria-hidden />
    </div>
  )
  if (hideLabel) {
    return (
      <div>
        <label htmlFor={id} className="sr-only">{label}</label>
        {control}
      </div>
    )
  }
  return <Field id={id} label={label} hint={hint} error={error} optional={optional}>{control}</Field>
})
