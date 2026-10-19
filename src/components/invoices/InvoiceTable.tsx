import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Trash2 } from 'lucide-react'
import type { InvoiceSummary } from '../../types/invoice'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { DeleteInvoiceDialog } from './DeleteInvoiceDialog'
import { formatDate, formatMoneyIn } from '../../utils/format'
import { displayStatus, invoiceDeleteMode } from '../../utils/invoiceStatus'

const th = 'px-4 py-3 text-left text-[0.66rem] font-medium uppercase tracking-[0.2em] text-ink-mute'

export function InvoiceTable({ invoices }: { invoices: InvoiceSummary[] }) {
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">Invoices</caption>
        <thead className="border-b border-line bg-cream/70">
          <tr>
            <th scope="col" className={`${th} w-[14%]`}>Invoice</th>
            <th scope="col" className={`${th} w-[17%]`}>Customer</th>
            <th scope="col" className={`${th} w-[12%]`}>Booking</th>
            <th scope="col" className={`${th} w-[12%]`}>Issued / due</th>
            <th scope="col" className={`${th} w-[11%]`}>Total</th>
            <th scope="col" className={`${th} w-[11%]`}>Balance</th>
            <th scope="col" className={`${th} w-[12%]`}>Status</th>
            <th scope="col" className={`${th} w-[11%]`}><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {invoices.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)}
        </tbody>
      </table>
    </div>
  )
}

function InvoiceRow({ invoice: inv }: { invoice: InvoiceSummary }) {
  const navigate = useNavigate()
  const href = `/dashboard/invoices/${inv.id}`
  const [deleting, setDeleting] = useState(false)
  return (
    <tr
      onClick={(e) => { if (!(e.target as HTMLElement).closest('a,button')) navigate(href) }}
      className="group cursor-pointer transition-colors hover:bg-cream/70"
    >
      <td className="px-4 py-3.5"><Link to={href} className="block truncate rounded font-medium text-ink hover:text-accent">{inv.invoice_number}</Link></td>
      <td className="truncate px-4 py-3.5 text-sm text-ink-soft" title={inv.customer_name}>{inv.customer_name}</td>
      <td className="truncate px-4 py-3.5 text-sm text-ink-soft">{inv.booking_number}</td>
      <td className="px-4 py-3.5 text-sm">
        <p className="font-medium text-ink">{formatDate(inv.issue_date)}</p>
        <p className="text-xs text-ink-mute">Due {formatDate(inv.due_date)}</p>
      </td>
      <td className="px-4 py-3.5 text-sm font-medium tabular-nums text-ink">{formatMoneyIn(inv.total_amount, inv.currency)}</td>
      <td className="px-4 py-3.5 text-sm tabular-nums text-ink-soft">{formatMoneyIn(inv.balance_due, inv.currency)}</td>
      <td className="px-4 py-3.5"><InvoiceStatusBadge status={displayStatus(inv)} size="sm" /></td>
      <td className="px-2 py-3.5 text-right">
        {invoiceDeleteMode(inv) !== 'blocked' && (
          <button type="button" onClick={() => setDeleting(true)} aria-label={`Delete invoice ${inv.invoice_number}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-mute transition-all hover:bg-danger-soft hover:text-danger">
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        )}
        {deleting && <div onClick={(e) => e.stopPropagation()}><DeleteInvoiceDialog invoice={inv} onClose={() => setDeleting(false)} /></div>}
        <Link to={href} aria-label={`View invoice ${inv.invoice_number} for ${inv.customer_name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-mute transition-all hover:bg-cream-deep hover:text-accent">
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </td>
    </tr>
  )
}
