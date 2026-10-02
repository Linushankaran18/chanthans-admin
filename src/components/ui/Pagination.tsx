import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, total, pageSize, onChange }: Props) {
  if (pages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const btn = 'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-line-strong bg-white px-4 text-sm font-medium text-ink transition-all duration-300 ease-lux hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-strong disabled:hover:text-ink'
  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-ink-mute" aria-live="polite">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
        </button>
        <span className="min-w-[5.5rem] text-center text-sm text-ink-soft">Page {page} of {pages}</span>
        <button type="button" className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  )
}
