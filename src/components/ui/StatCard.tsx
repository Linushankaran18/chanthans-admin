import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: ReactNode
  icon: LucideIcon
  /** hero: dark spotlight card; accent: tinted; default: plain */
  variant?: 'hero' | 'accent' | 'default'
  caption?: ReactNode
  to?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, variant = 'default', caption, to, className = '' }: Props) {
  const hero = variant === 'hero'
  const surface = hero
    ? 'relative overflow-hidden rounded-2xl bg-ink text-white shadow-lift'
    : variant === 'accent'
      ? 'card-surface border-accent/20 bg-[#faf6fd]'
      : 'card-surface'
  const body = (
    <>
      {hero && (
        <>
          <div className="brand-bar absolute inset-x-0 top-0 h-1" aria-hidden />
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-purple/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-cyan/15 blur-3xl" aria-hidden />
        </>
      )}
      <div className="relative flex items-center justify-between gap-3">
        <div className={`flex items-center gap-2.5 ${hero ? 'text-white/80' : 'text-ink-mute'}`}>
          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${hero ? 'bg-white/10 text-brand-cyan' : 'bg-[#f5effb] text-accent'}`}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <h3 className={`text-[0.68rem] font-medium uppercase tracking-luxe ${hero ? 'text-white/75' : 'text-ink-mute'}`}>{label}</h3>
        </div>
        {to && <ArrowUpRight className={`h-4 w-4 transition-transform duration-300 ease-lux group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${hero ? 'text-white/70' : 'text-ink-mute'}`} aria-hidden />}
      </div>
      <div className={`relative mt-5 font-sans font-light tabular-nums tracking-tight leading-none ${hero ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl'} ${hero ? 'text-white' : 'text-ink'}`}>{value}</div>
      {caption && <div className={`relative mt-4 text-sm ${hero ? 'text-white/80' : 'text-ink-soft'}`}>{caption}</div>}
    </>
  )
  const cls = `group block min-w-0 p-5 sm:p-6 ${surface} ${className}`
  if (to) {
    return (
      <Link to={to} className={`${cls} transition-all duration-300 ease-lux hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-offset-cream`}>
        {body}
      </Link>
    )
  }
  return <div className={cls}>{body}</div>
}
