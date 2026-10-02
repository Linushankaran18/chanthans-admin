import type { ElementType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function Card({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <Tag className={`card-surface min-w-0 p-5 sm:p-6 ${className}`}>{children}</Tag>
}

interface HeaderProps {
  title: string
  icon?: LucideIcon
  action?: ReactNode
  id?: string
}

export function CardHeader({ title, icon: Icon, action, id }: HeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5effb] text-accent">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <h2 id={id} className="eyebrow">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/** Label + value row for read-only details. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-sm text-ink-mute">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-ink sm:text-right">{children}</dd>
    </div>
  )
}
