import { formatDate, formatMoneyIn } from '../../utils/format'
import { INVOICE_STATUS_META } from '../../utils/invoiceStatus'
import type { Invoice, InvoiceSettings, InvoiceStatus } from '../../types/invoice'

/** Everything the document needs, independent of whether it comes from a saved invoice or a form. */
export interface InvoiceDocumentData {
  invoiceNumber: string | null
  issueDate: string
  dueDate: string
  /** Display status (OVERDUE already resolved). */
  status: InvoiceStatus
  currency: string
  customerName: string
  customerLines: string[]
  bookingNumber: string
  serviceType: string
  eventDate: string
  items: { description: string; quantity: number; unitPrice: number; amount: number }[]
  subtotal: number
  discount: number
  taxLabel: string | null
  tax: number
  total: number
  paid: number
  balance: number
  notes: string | null
  terms: string | null
}

export function invoiceToDocument(inv: Invoice): InvoiceDocumentData {
  const taxed = inv.tax_amount > 0 || (inv.tax_rate ?? 0) > 0
  return {
    invoiceNumber: inv.invoice_number,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
    status: inv.display_status ?? inv.status,
    currency: inv.currency,
    customerName: inv.customer_name,
    customerLines: [...(inv.billing_address ?? '').split('\n'), inv.customer_email ?? '', inv.customer_phone ?? ''].filter((l) => l.trim()),
    bookingNumber: inv.booking_number,
    serviceType: inv.service_type,
    eventDate: inv.event_date,
    items: inv.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unit_price, amount: i.line_total })),
    subtotal: inv.subtotal,
    discount: inv.discount_amount,
    taxLabel: taxed ? `${inv.tax_name || 'Tax'}${inv.tax_rate != null ? ` (${inv.tax_rate}%)` : ''}` : null,
    tax: inv.tax_amount,
    total: inv.total_amount,
    paid: inv.amount_paid,
    balance: inv.balance_due,
    notes: inv.notes,
    terms: inv.terms,
  }
}

const LOGO_FALLBACK = '/logo/logo_removeback.png'
const eyebrow = 'text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-mute'

/**
 * Document-style invoice that mirrors the PDF (Chanthans-backend/app/templates/invoice.html):
 * same structure, hierarchy and brand tokens. The PDF stays the source of truth for print.
 */
export function InvoiceDocument({ data, settings }: { data: InvoiceDocumentData; settings: InvoiceSettings | undefined }) {
  const money = (v: number) => formatMoneyIn(v, data.currency)
  const meta = INVOICE_STATUS_META[data.status]
  const StatusIcon = meta.icon
  const watermark = data.status === 'DRAFT' ? 'DRAFT' : data.status === 'CANCELLED' ? 'CANCELLED' : null
  const businessLines = [...(settings?.business_address ?? '').split('\n'), settings?.business_phone ?? '', settings?.business_email ?? '', settings?.business_website ?? '']
    .map((l) => l.trim())
    .filter(Boolean)
  const logo = settings?.business_logo_url || LOGO_FALLBACK

  return (
    <article aria-label={data.invoiceNumber ? `Invoice ${data.invoiceNumber}` : 'Invoice preview'} className="relative mx-auto w-full max-w-[860px] overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="h-[9px] bg-brand-gradient" aria-hidden />
      {watermark && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 -rotate-[22deg] select-none text-center font-display text-[5.5rem] font-semibold tracking-[0.08em] text-ink/[0.055] sm:text-[8rem]">
          {watermark}
        </div>
      )}

      <div className="relative px-5 pb-8 pt-7 sm:px-12 sm:pb-12 sm:pt-10">
        {/* Header */}
        <header className="flex flex-col gap-7 border-b border-line pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <img src={logo} alt="" className="h-16 w-16 shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="font-display text-[1.7rem] font-semibold leading-none">{settings?.business_name ?? 'Chanthans'}</p>
              <div className="mt-2 space-y-0.5 text-[0.8rem] leading-relaxed text-ink-soft">
                {businessLines.map((l) => <p key={l} className="break-words">{l}</p>)}
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="font-display text-5xl font-medium uppercase leading-[0.95] tracking-[0.16em] text-brand-aubergine sm:text-6xl">Invoice</p>
            <dl className="mt-5 inline-grid grid-cols-[auto_auto] items-center gap-x-5 gap-y-1.5 text-left sm:text-right">
              <dt className={`${eyebrow} sm:text-right`}>Invoice no.</dt>
              <dd className="text-sm font-medium tabular-nums">{data.invoiceNumber ?? <span className="text-ink-mute">Assigned on save</span>}</dd>
              <dt className={`${eyebrow} sm:text-right`}>Issued</dt>
              <dd className="text-sm font-medium tabular-nums">{formatDate(data.issueDate)}</dd>
              <dt className={`${eyebrow} sm:text-right`}>Due</dt>
              <dd className="text-sm font-medium tabular-nums">{formatDate(data.dueDate)}</dd>
              <dt className={`${eyebrow} sm:text-right`}>Status</dt>
              <dd>
                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${meta.pill}`}>
                  <StatusIcon className="h-3 w-3" aria-hidden />
                  {meta.label}
                </span>
              </dd>
            </dl>
          </div>
        </header>

        {/* Parties */}
        <section className="grid gap-6 py-7 sm:grid-cols-2 sm:gap-12">
          <div>
            <p className={`${eyebrow} mb-2`}>Bill to</p>
            <p className="break-words text-lg font-semibold leading-tight">{data.customerName || <span className="font-normal text-ink-mute">Customer name</span>}</p>
            <div className="mt-1 space-y-0.5 text-sm text-ink-soft">
              {data.customerLines.map((l) => <p key={l} className="break-words">{l}</p>)}
            </div>
          </div>
          <div>
            <p className={`${eyebrow} mb-2`}>Session</p>
            <dl className="grid grid-cols-[6.5rem_1fr] gap-y-1 text-sm">
              <dt className="text-ink-mute">Booking</dt><dd className="font-medium">{data.bookingNumber}</dd>
              <dt className="text-ink-mute">Service</dt><dd className="break-words font-medium">{data.serviceType}</dd>
              <dt className="text-ink-mute">Event date</dt><dd className="font-medium">{formatDate(data.eventDate)}</dd>
            </dl>
          </div>
        </section>

        {/* Items */}
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Invoice line items</caption>
          <thead>
            <tr className="border-b border-brand-aubergine">
              <th scope="col" className={`${eyebrow} pb-2.5 text-left`}>Description</th>
              <th scope="col" className={`${eyebrow} hidden w-16 pb-2.5 text-right sm:table-cell`}>Qty</th>
              <th scope="col" className={`${eyebrow} hidden w-32 pb-2.5 text-right sm:table-cell`}>Unit price</th>
              <th scope="col" className={`${eyebrow} w-28 pb-2.5 text-right sm:w-32`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border-b border-line align-top">
                <td className="break-words py-3 pr-4 font-medium">
                  {item.description || <span className="font-normal text-ink-mute">Untitled item</span>}
                  <span className="mt-0.5 block text-xs font-normal text-ink-mute sm:hidden">{item.quantity} × {money(item.unitPrice)}</span>
                </td>
                <td className="hidden py-3 text-right tabular-nums sm:table-cell">{item.quantity}</td>
                <td className="hidden py-3 text-right tabular-nums sm:table-cell">{money(item.unitPrice)}</td>
                <td className="py-3 text-right font-semibold tabular-nums">{money(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <dl className="w-full text-sm sm:w-[21.5rem]">
            <div className="flex justify-between py-1.5 text-ink-soft"><dt>Subtotal</dt><dd className="tabular-nums">{money(data.subtotal)}</dd></div>
            {data.discount > 0 && <div className="flex justify-between py-1.5 text-ink-soft"><dt>Discount</dt><dd className="tabular-nums">−{money(data.discount)}</dd></div>}
            {data.taxLabel && <div className="flex justify-between py-1.5 text-ink-soft"><dt>{data.taxLabel}</dt><dd className="tabular-nums">{money(data.tax)}</dd></div>}
            <div className="mt-1.5 flex justify-between border-t border-ink pt-3 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{money(data.total)}</dd></div>
            <div className="flex justify-between py-1.5 text-ink-soft"><dt>Amount paid</dt><dd className="tabular-nums">{money(data.paid)}</dd></div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-aubergine px-5 py-4 text-white">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/85">Balance due</dt>
              <dd className="font-display text-3xl font-semibold leading-none tabular-nums">{money(data.balance)}</dd>
            </div>
          </dl>
        </div>

        {/* Notes & terms */}
        {(data.notes || data.terms) && (
          <section className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-12">
            {data.notes && <div><p className={`${eyebrow} mb-2`}>Notes</p><p className="whitespace-pre-wrap break-words text-[0.85rem] leading-relaxed text-ink-soft">{data.notes}</p></div>}
            {data.terms && <div><p className={`${eyebrow} mb-2`}>Payment terms</p><p className="whitespace-pre-wrap break-words text-[0.85rem] leading-relaxed text-ink-soft">{data.terms}</p></div>}
          </section>
        )}

        <footer className="mt-10 border-t border-line pt-3 text-center text-[0.7rem] text-ink-mute">
          {[settings?.business_name, settings?.business_website, settings?.business_email, settings?.business_phone].filter(Boolean).join('  ·  ')}
        </footer>
      </div>
    </article>
  )
}
