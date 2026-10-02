import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  /** Compact variant for use inside cards. */
  compact?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, compact }: Props) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'px-4 py-10' : 'card-surface px-6 py-16'}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5effb] text-accent">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-3xl font-normal leading-tight">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
