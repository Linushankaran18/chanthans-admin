import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { Field, describedBy } from './Field'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  hideLabel?: boolean
}

function makePicker(type: 'date' | 'time', displayName: string) {
  const Component = forwardRef<HTMLInputElement, Props>(function Picker(
    { label, hint, error, optional, hideLabel, className = '', ...rest },
    ref,
  ) {
    const id = useId()
    const input = (
      <input
        ref={ref}
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`input-field min-w-0 ${error ? '!border-danger' : ''} ${className}`}
        {...rest}
      />
    )
    if (hideLabel) {
      return (
        <div>
          <label htmlFor={id} className="sr-only">{label}</label>
          {input}
        </div>
      )
    }
    return <Field id={id} label={label} hint={hint} error={error} optional={optional}>{input}</Field>
  })
  Component.displayName = displayName
  return Component
}

/** Styled native date picker (mobile-friendly). Value is YYYY-MM-DD. */
export const DateField = makePicker('date', 'DateField')
/** Styled native time picker. Value is HH:MM. */
export const TimeField = makePicker('time', 'TimeField')
