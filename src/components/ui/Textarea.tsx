import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { Field, describedBy } from './Field'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, hint, error, optional, className = '', rows = 4, ...rest },
  ref,
) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`input-field min-h-[110px] resize-y py-3 leading-relaxed ${error ? '!border-danger' : ''} ${className}`}
        {...rest}
      />
    </Field>
  )
})
