import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Eye, EyeOff, FileText, ListPlus, NotebookPen, Percent, Plus, Trash2, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { InvoiceSettings, InvoiceStatus } from '../../types/invoice'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { DateField } from '../ui/DateField'
import { Textarea } from '../ui/Textarea'
import { TextField } from '../ui/TextField'
import { formatDate, formatMoneyIn } from '../../utils/format'
import { InvoiceDocument } from './InvoiceDocument'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { formToDocument, totalsFromForm } from './invoiceMapping'
import { EMPTY_INVOICE_ITEM, invoiceSchema, type InvoiceFormValues } from './invoiceSchema'

export type InvoiceSubmitIntent = 'draft' | 'issue' | 'save'

interface Props {
  mode: 'create' | 'edit'
  defaultValues: InvoiceFormValues
  /** Real number on edit; the upcoming one on create (shown as "assigned on save"). */
  invoiceNumber: string
  /** Stored status when editing. */
  status?: InvoiceStatus
  booking: { booking_number: string; service_type: string; event_date: string }
  settings: InvoiceSettings | undefined
  /** Which submit button is busy, if any. */
  submitting: InvoiceSubmitIntent | null
  errorMessage: string | null
  fieldErrors?: Record<string, string>
  notice?: ReactNode
  cancelTo: string
  onSubmit: (values: InvoiceFormValues, intent: InvoiceSubmitIntent) => void
}

function Section({ title, icon, children, description }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) {
  return (
    <Card as="section">
      <CardHeader title={title} icon={icon} />
      {description && <p className="-mt-2 mb-4 text-sm text-ink-soft">{description}</p>}
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </Card>
  )
}

const rowInput = 'input-field'
const miniLabel = 'mb-1 block text-[0.62rem] font-medium uppercase tracking-[0.16em] text-ink-soft sm:hidden'
const iconBtn = 'inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-deep hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-soft sm:h-9 sm:w-9'

export function InvoiceForm({
  mode, defaultValues, invoiceNumber, status = 'DRAFT', booking, settings, submitting, errorMessage, fieldErrors = {}, notice, cancelTo, onSubmit,
}: Props) {
  const {
    register, handleSubmit, control, trigger,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<InvoiceFormValues>({ resolver: zodResolver(invoiceSchema), defaultValues, mode: 'onTouched' })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' })
  const [showPreview, setShowPreview] = useState(false)

  const watched = useWatch({ control }) as InvoiceFormValues
  const totals = totalsFromForm(watched)
  const currency = (watched.currency || 'CAD').trim().toUpperCase()
  const money = (v: number) => formatMoneyIn(v, /^[A-Z]{3}$/.test(currency) ? currency : 'CAD')

  // Cross-field rules re-evaluate live once the user has touched the field (or tried to submit).
  const revalidate = (name: 'discount_amount' | 'amount_paid' | 'due_date') => {
    if (touchedFields[name] || isSubmitted) void trigger(name)
  }

  const err = (k: keyof InvoiceFormValues) => (errors[k] as { message?: string } | undefined)?.message ?? fieldErrors[k]
  const itemErr = (i: number, k: 'description' | 'quantity' | 'unit_price') => errors.items?.[i]?.[k]?.message
  const itemsError = errors.items?.root?.message ?? errors.items?.message ?? fieldErrors.items ?? fieldErrors.quantity ?? fieldErrors.unit_price ?? fieldErrors.description

  const isDraft = status === 'DRAFT'
  const doc = formToDocument(watched, totals, {
    invoiceNumber: mode === 'edit' ? invoiceNumber : null,
    status: mode === 'create' ? 'DRAFT' : status,
    bookingNumber: booking.booking_number,
    serviceType: booking.service_type,
    eventDate: booking.event_date,
  })
  const busy = submitting !== null

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-5">
      {errorMessage && <Alert>{errorMessage}</Alert>}
      {notice}

      <Card as="section">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-ink-mute">Booking</dt><dd className="font-medium">{booking.booking_number}</dd></div>
          <div><dt className="text-ink-mute">Service</dt><dd className="font-medium">{booking.service_type}</dd></div>
          <div><dt className="text-ink-mute">Event date</dt><dd className="font-medium">{formatDate(booking.event_date)}</dd></div>
        </dl>
      </Card>

      <Section title="Customer" icon={User} description="Pre-filled from the booking — change anything that should read differently on the invoice.">
        <div className="sm:col-span-2"><TextField label="Customer name" autoComplete="off" maxLength={255} error={err('customer_name')} {...register('customer_name')} /></div>
        <TextField label="Email" type="email" inputMode="email" autoComplete="off" error={err('customer_email')} {...register('customer_email')} />
        <TextField label="Phone" type="tel" inputMode="tel" autoComplete="off" error={err('customer_phone')} {...register('customer_phone')} />
        <div className="sm:col-span-2"><Textarea label="Billing address" optional rows={3} maxLength={1000} error={err('billing_address')} {...register('billing_address')} /></div>
      </Section>

      <Section title="Invoice details" icon={FileText}>
        <div>
          <TextField label="Invoice number" readOnly value={mode === 'edit' ? invoiceNumber : 'Assigned on save'} hint={mode === 'edit' ? undefined : `Next up: ${invoiceNumber}`} />
        </div>
        <div>
          <p className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Status</p>
          <div className="flex min-h-[44px] items-center"><InvoiceStatusBadge status={mode === 'create' ? 'DRAFT' : status} /></div>
        </div>
        <DateField label="Issue date" error={err('issue_date')} {...register('issue_date', { onChange: () => revalidate('due_date') })} />
        <DateField label="Due date" error={err('due_date')} {...register('due_date')} />
        <TextField label="Currency" maxLength={3} autoComplete="off" className="uppercase" hint={settings ? `Studio default: ${settings.currency}` : undefined} error={err('currency')} {...register('currency')} />
      </Section>

      <Card as="section">
        <CardHeader title="Line items" icon={ListPlus} />
        <div className="hidden grid-cols-[minmax(0,1fr)_5.5rem_8rem_7.5rem_8.5rem] gap-3 px-1 pb-2 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-ink-soft sm:grid" aria-hidden>
          <span>Description</span><span>Qty</span><span>Unit price</span><span className="text-right">Line total</span><span />
        </div>
        <ul className="space-y-4 sm:space-y-3">
          {fields.map((field, i) => (
            <li key={field.id} className="rounded-xl border border-line bg-cream/50 p-3 sm:border-0 sm:bg-transparent sm:p-0">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_5.5rem_8rem_7.5rem_8.5rem] sm:items-start">
                <div className="col-span-2 sm:col-span-1">
                  <label className={miniLabel} htmlFor={`item-${i}-description`}>Description</label>
                  <input id={`item-${i}-description`} aria-label={`Line ${i + 1} description`} aria-invalid={itemErr(i, 'description') ? true : undefined} placeholder="e.g. Wedding photography package" maxLength={500} autoComplete="off" className={`${rowInput} ${itemErr(i, 'description') ? '!border-danger' : ''}`} {...register(`items.${i}.description`)} />
                  {itemErr(i, 'description') && <p role="alert" className="mt-1.5 text-sm text-danger">{itemErr(i, 'description')}</p>}
                </div>
                <div>
                  <label className={miniLabel} htmlFor={`item-${i}-quantity`}>Qty</label>
                  <input id={`item-${i}-quantity`} aria-label={`Line ${i + 1} quantity`} aria-invalid={itemErr(i, 'quantity') ? true : undefined} inputMode="decimal" autoComplete="off" className={`${rowInput} ${itemErr(i, 'quantity') ? '!border-danger' : ''}`} {...register(`items.${i}.quantity`)} />
                  {itemErr(i, 'quantity') && <p role="alert" className="mt-1.5 text-sm text-danger">{itemErr(i, 'quantity')}</p>}
                </div>
                <div>
                  <label className={miniLabel} htmlFor={`item-${i}-unit`}>Unit price</label>
                  <input id={`item-${i}-unit`} aria-label={`Line ${i + 1} unit price`} aria-invalid={itemErr(i, 'unit_price') ? true : undefined} inputMode="decimal" placeholder="0.00" autoComplete="off" className={`${rowInput} ${itemErr(i, 'unit_price') ? '!border-danger' : ''}`} {...register(`items.${i}.unit_price`)} />
                  {itemErr(i, 'unit_price') && <p role="alert" className="mt-1.5 text-sm text-danger">{itemErr(i, 'unit_price')}</p>}
                </div>
                <div className="flex items-center justify-between sm:block sm:pt-2.5 sm:text-right">
                  <span className={miniLabel.replace('mb-1 ', '')}>Line total</span>
                  <output aria-label={`Line ${i + 1} total`} className="text-sm font-semibold tabular-nums">{money(totals.lineTotals[i] ?? 0)}</output>
                </div>
                <div className="flex items-center justify-end gap-0.5">
                  <button type="button" className={iconBtn} onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move line ${i + 1} up`}><ArrowUp className="h-4 w-4" aria-hidden /></button>
                  <button type="button" className={iconBtn} onClick={() => move(i, i + 1)} disabled={i === fields.length - 1} aria-label={`Move line ${i + 1} down`}><ArrowDown className="h-4 w-4" aria-hidden /></button>
                  <button type="button" className={`${iconBtn} hover:!bg-danger-soft hover:!text-danger`} onClick={() => remove(i)} disabled={fields.length === 1} aria-label={`Remove line ${i + 1}`}><Trash2 className="h-4 w-4" aria-hidden /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {itemsError && <p role="alert" className="mt-3 text-sm text-danger">{itemsError}</p>}
        <Button variant="secondary" className="mt-4" onClick={() => append({ ...EMPTY_INVOICE_ITEM })}><Plus className="h-4 w-4" aria-hidden /> Add line item</Button>
      </Card>

      <Card as="section">
        <CardHeader title="Adjustments" icon={Percent} />
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,19rem)]">
          <div className="grid content-start gap-5 sm:grid-cols-2">
            <TextField label="Discount" inputMode="decimal" autoComplete="off" placeholder="0.00" error={err('discount_amount')} {...register('discount_amount', { onChange: () => revalidate('discount_amount') })} />
            <TextField label="Amount paid" inputMode="decimal" autoComplete="off" placeholder="0.00" hint={mode === 'create' ? 'Pre-filled from the booking deposit.' : undefined} error={err('amount_paid')} {...register('amount_paid', { onChange: () => revalidate('amount_paid') })} />
            <TextField label="Tax name" autoComplete="off" placeholder="e.g. HST" maxLength={50} error={err('tax_name')} {...register('tax_name')} />
            <TextField label="Tax rate (%)" inputMode="decimal" autoComplete="off" placeholder="0" hint="Leave blank for no tax." error={err('tax_rate')} {...register('tax_rate', { onChange: () => { revalidate('discount_amount'); revalidate('amount_paid') } })} />
          </div>
          <div aria-live="polite" aria-label="Invoice totals" className="rounded-xl border border-line bg-cream p-4">
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-baseline justify-between gap-4"><dt className="text-ink-mute">Subtotal</dt><dd className="font-medium tabular-nums">{money(totals.subtotal)}</dd></div>
              {totals.discount > 0 && <div className="flex items-baseline justify-between gap-4"><dt className="text-ink-mute">Discount</dt><dd className="font-medium tabular-nums">−{money(totals.discount)}</dd></div>}
              {doc.taxLabel && <div className="flex items-baseline justify-between gap-4"><dt className="text-ink-mute">{doc.taxLabel}</dt><dd className="font-medium tabular-nums">{money(totals.tax)}</dd></div>}
              <div className="h-px bg-line-strong" aria-hidden />
              <div className="flex items-baseline justify-between gap-4"><dt className="font-medium text-ink">Total</dt><dd className="text-lg font-semibold tabular-nums">{money(totals.total)}</dd></div>
              <div className="flex items-baseline justify-between gap-4"><dt className="text-ink-mute">Amount paid</dt><dd className="font-medium tabular-nums">{money(totals.paid)}</dd></div>
              <div className="flex items-baseline justify-between gap-4"><dt className="font-medium text-ink">Balance due</dt><dd className={`text-2xl font-medium tabular-nums leading-none ${totals.overpaid ? 'text-danger' : ''}`}>{money(Math.max(totals.balance, 0))}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-ink-mute">Shown for convenience — the final amounts are calculated when you save.</p>
          </div>
        </div>
      </Card>

      <Card as="section">
        <CardHeader title="Notes & terms" icon={NotebookPen} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Textarea label="Invoice notes" optional hint="Printed on the invoice." maxLength={5000} error={err('notes')} {...register('notes')} />
          <Textarea label="Payment terms" optional hint="Printed on the invoice." maxLength={5000} error={err('terms')} {...register('terms')} />
        </div>
      </Card>

      {showPreview && (
        <section aria-label="Invoice preview" className="space-y-3">
          <p className="eyebrow">Preview</p>
          <InvoiceDocument data={doc} settings={settings} />
        </section>
      )}

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-col-reverse gap-3 border-t border-line bg-cream/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:flex-row sm:flex-wrap sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Link to={cancelTo} className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line-strong bg-white px-6 text-sm font-medium tracking-wide text-ink transition-all duration-300 ease-lux hover:border-accent/50 hover:text-accent">Cancel</Link>
        <Button variant="secondary" aria-pressed={showPreview} onClick={() => { void trigger(); setShowPreview((s) => !s) }}>
          {showPreview ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          {showPreview ? 'Hide preview' : 'Preview'}
        </Button>
        {mode === 'create' || isDraft ? (
          <>
            <Button variant="secondary" disabled={busy} loading={submitting === 'draft'} onClick={handleSubmit((v) => onSubmit(v, 'draft'))}>Save draft</Button>
            <Button disabled={busy} loading={submitting === 'issue'} onClick={handleSubmit((v) => onSubmit(v, 'issue'))}>Issue invoice</Button>
          </>
        ) : (
          <Button disabled={busy} loading={submitting === 'save'} onClick={handleSubmit((v) => onSubmit(v, 'save'))}>Save changes</Button>
        )}
      </div>
    </form>
  )
}
