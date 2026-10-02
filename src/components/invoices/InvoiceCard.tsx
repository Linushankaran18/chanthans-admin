import { Link } from 'react-router-dom'
import { CalendarClock, ChevronRight } from 'lucide-react'
import type { InvoiceSummary } from '../../types/invoice'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { formatDate, formatMoneyIn } from '../../utils/format'
import { displayStatus } from '../../utils/invoiceStatus'

/** Mobile list item. The whole card is one link. */
export function InvoiceCard({ invoice: inv }: { invoice: InvoiceSummary }) {
  return (
    <Link
      to={`/dashboard/invoices/${inv.id}`}
      className="card-surface group block p-4 transition-all duration-300 ease-lux hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-offset-cream"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{inv.invoice_number}</p>
          <p className="truncate text-sm text-ink-soft">{inv.customer_name} · <span className="text-ink-mute">{inv.booking_number}</span></p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
        <CalendarClock className="h-4 w-4 shrink-0 text-ink-mute" aria-hidden />
        Issued {formatDate(inv.issue_date)} · Due {formatDate(inv.due_date)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <InvoiceStatusBadge status={displayStatus(inv)} size="sm" />
        <p className="text-right text-sm text-ink-soft">
          <span className="font-medium tabular-nums text-ink">{formatMoneyIn(inv.total_amount, inv.currency)}</span>
          <span className="block text-xs text-ink-mute">Balance {formatMoneyIn(inv.balance_due, inv.currency)}</span>
        </p>
      </div>
    </Link>
  )
}
