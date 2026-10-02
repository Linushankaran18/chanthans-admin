import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface Props {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  back?: { to: string; label: string }
}

export function PageHeader({ eyebrow, title, description, actions, back }: Props) {
  return (
    <header className="mb-8 sm:mb-10">
      {back && (
        <Link to={back.to} className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-medium text-ink-soft transition-colors hover:text-accent sm:-ml-1 sm:px-1">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 lg:flex-1">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="page-title mt-3 break-words">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-ink-soft">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  )
}
