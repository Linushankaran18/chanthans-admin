import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const styles: Record<Variant, string> = {
  primary: 'bg-gradient-to-br from-accent to-brand-aubergine text-white shadow-[0_10px_24px_-12px_rgba(74,29,110,0.7)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_rgba(74,29,110,0.65)] active:translate-y-0',
  secondary: 'border border-line-strong bg-white text-ink hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent',
  danger: 'bg-danger text-white hover:-translate-y-0.5 hover:bg-danger-hover focus-visible:ring-danger',
  ghost: 'text-ink-soft hover:bg-cream-deep hover:text-ink',
}

export function buttonClasses(variant: Variant = 'primary', className = ''): string {
  return `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-wide transition-all duration-300 ease-lux disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${styles[variant]} ${className}`
}

export function Button({ variant = 'primary', loading, disabled, className = '', children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, className)}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
