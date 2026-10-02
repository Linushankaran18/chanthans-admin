import { Link } from 'react-router-dom'
import { Download, Eye, FilePlus, Pencil, Receipt } from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'
import { Button, buttonClasses } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { useInvoiceForBooking } from '../../hooks/useInvoices'
import { useInvoicePdf } from '../../hooks/useInvoicePdf'
import { formatMoneyIn } from '../../utils/format'
import { displayStatus, invoiceCapabilities } from '../../utils/invoiceStatus'

/** Invoice section on the booking detail page. */
export function BookingInvoiceCard({ bookingId }: { bookingId: string }) {
  const query = useInvoiceForBooking(bookingId)
  const inv = query.data ?? undefined
  const pdf = useInvoicePdf(inv)

  if (query.isLoading) {
    return (
      <Card as="section">
        <CardHeader title="Invoice" icon={Receipt} />
        <div role="status" aria-label="Loading invoice" className="space-y-3"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-16 w-full !rounded-xl" /></div>
      </Card>
    )
  }

  if (query.isError) {
    return (
      <Card as="section">
        <CardHeader title="Invoice" icon={Receipt} />
        <p role="alert" className="text-sm text-danger">Unable to load the invoice.</p>
        <Button variant="secondary" className="mt-3" onClick={() => query.refetch()} loading={query.isFetching}>Try again</Button>
      </Card>
    )
  }

  if (!inv) {
    return (
      <Card as="section">
        <CardHeader title="Invoice" icon={Receipt} />
        <p className="mb-4 text-sm text-ink-soft">No invoice yet. Create one from this booking — the client details and payment are filled in for you.</p>
        <Link to={`/dashboard/invoices/new?bookingId=${bookingId}`} className={buttonClasses('primary')}>
          <FilePlus className="h-4 w-4" aria-hidden /> Create invoice
        </Link>
      </Card>
    )
  }

  const money = (v: number) => formatMoneyIn(v, inv.currency)
  const caps = invoiceCapabilities(displayStatus(inv))
  return (
    <Card as="section">
      <CardHeader title="Invoice" icon={Receipt} action={<InvoiceStatusBadge status={displayStatus(inv)} size="sm" />} />
      <p className="mb-3 font-display text-2xl leading-tight">{inv.invoice_number}</p>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-ink-mute">Total</dt><dd className="font-medium tabular-nums">{money(inv.total_amount)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-ink-mute">Paid</dt><dd className="font-medium tabular-nums">{money(inv.amount_paid)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="font-medium text-ink">Balance due</dt><dd className="font-semibold tabular-nums">{money(inv.balance_due)}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/dashboard/invoices/${inv.id}`} className={buttonClasses('secondary', '!px-4')}><Eye className="h-4 w-4" aria-hidden /> View</Link>
        {caps.canEdit && <Link to={`/dashboard/invoices/${inv.id}/edit`} className={buttonClasses('secondary', '!px-4')}><Pencil className="h-4 w-4" aria-hidden /> Edit</Link>}
        <Button variant="secondary" className="!px-4" onClick={pdf.download} loading={pdf.busy === 'download'}><Download className="h-4 w-4" aria-hidden /> Download PDF</Button>
      </div>
    </Card>
  )
}
