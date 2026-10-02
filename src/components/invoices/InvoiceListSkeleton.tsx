import { Skeleton } from '../ui/Skeleton'

export function InvoiceListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading invoices">
      <span className="sr-only">Loading invoices…</span>
      <div className="card-surface hidden overflow-hidden md:block">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0">
            <Skeleton className="h-4 w-28" /><div className="flex-1"><Skeleton className="h-4 w-1/2" /></div>
            <Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-24 !rounded-full" />
          </div>
        ))}
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, i) => (
          <div key={i} className="card-surface space-y-3 p-4"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>
        ))}
      </div>
    </div>
  )
}
