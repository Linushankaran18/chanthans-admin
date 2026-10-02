import { forwardRef, useId, type InputHTMLAttributes } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}

export const Toggle = forwardRef<HTMLInputElement, Props>(function Toggle({ label, description, ...rest }, ref) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-mute">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input ref={ref} id={id} type="checkbox" role="switch" className="peer sr-only" {...rest} />
        <span className="h-7 w-12 rounded-full bg-line-strong transition-colors duration-300 ease-lux peer-checked:bg-gradient-to-r peer-checked:from-brand-purple peer-checked:to-brand-aubergine peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-disabled:opacity-60" />
        <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-lux peer-checked:translate-x-5" />
      </span>
    </label>
  )
})
