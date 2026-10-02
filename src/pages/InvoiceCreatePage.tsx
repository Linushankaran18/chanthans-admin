import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, FileWarning, SearchX } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/ErrorState'
import { EmptyState } from '../components/ui/EmptyState'
import { Alert } from '../components/ui/Alert'
import { buttonClasses } from '../components/ui/Button'
import { InvoiceForm, type InvoiceSubmitIntent } from '../components/invoices/InvoiceForm'
import { draftToForm, formToInput } from '../components/invoices/invoiceMapping'
import type { InvoiceFormValues } from '../components/invoices/invoiceSchema'
import { useCreateInvoice, useInvoiceDraft, useInvoiceSettings } from '../hooks/useInvoices'
import { useToast } from '../contexts/ToastContext'
import { fieldErrorsFrom422, getInvoiceExists, invoiceActionFailedMessage, isNotFound, loadFailedMessage } from '../utils/errors'

function FormSkeleton() {
  return (
    <div role="status" aria-label="Loading invoice" className="space-y-5">
      <Skeleton className="h-12 w-64" />
      {[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 w-full !rounded-2xl" />)}
    </div>
  )
}

export default function InvoiceCreatePage() {
  const [sp] = useSearchParams()
  const bookingId = sp.get('bookingId') ?? undefined
  const navigate = useNavigate()
  const toast = useToast()
  const draft = useInvoiceDraft(bookingId)
  const settings = useInvoiceSettings()
  const create = useCreateInvoice()
  const [intent, setIntent] = useState<InvoiceSubmitIntent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [existingId, setExistingId] = useState<string | null>(null)

  if (!bookingId) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Choose a booking first"
        description="Invoices are created from a booking, so the client details and payment come with it."
        action={<Link to="/dashboard/bookings" className={buttonClasses('primary')}>View Bookings</Link>}
      />
    )
  }
  if (draft.isLoading) return <FormSkeleton />
  if (draft.isError || !draft.data) {
    if (isNotFound(draft.error)) {
      return <EmptyState icon={SearchX} title="Booking not found" description="It may have been deleted." action={<Link to="/dashboard/bookings" className={buttonClasses('primary')}>Back to bookings</Link>} />
    }
    return <ErrorState message={loadFailedMessage(draft.error, 'this booking')} onRetry={() => draft.refetch()} retrying={draft.isFetching} />
  }

  const d = draft.data
  const bookingPath = `/dashboard/bookings/${d.booking_id}`
  const existing = existingId ?? d.existing_invoice_id

  if (existing) {
    return (
      <div className="animate-fade-up">
        <PageHeader back={{ to: bookingPath, label: d.booking_number }} eyebrow={d.booking_number} title="New invoice" />
        <EmptyState
          icon={FileWarning}
          title="This booking already has an invoice"
          description="Each booking has one invoice for now. Open the existing one to view, edit or download it."
          action={<Link to={`/dashboard/invoices/${existing}`} className={buttonClasses('primary')}>View existing invoice</Link>}
        />
      </div>
    )
  }

  function submit(values: InvoiceFormValues, which: InvoiceSubmitIntent) {
    setError(null); setFieldErrors({}); setIntent(which)
    create.mutate(
      { bookingId: d.booking_id, input: formToInput(values), status: which === 'issue' ? 'ISSUED' : 'DRAFT' },
      {
        onSuccess: (inv) => {
          toast.success(which === 'issue' ? `Invoice ${inv.invoice_number} issued.` : `Draft ${inv.invoice_number} saved.`)
          navigate(`/dashboard/invoices/${inv.id}`, { replace: true })
        },
        onError: (e) => {
          setIntent(null)
          const exists = getInvoiceExists(e)
          if (exists) { setExistingId(exists); return }
          setFieldErrors(fieldErrorsFrom422(e))
          setError(invoiceActionFailedMessage(e, 'create the invoice'))
        },
      },
    )
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        back={{ to: bookingPath, label: d.booking_number }}
        eyebrow={d.booking_number}
        title="New invoice"
        description="Check the details, adjust the line items, then save a draft or issue it."
      />
      <InvoiceForm
        mode="create"
        defaultValues={draftToForm(d)}
        invoiceNumber={d.next_invoice_number}
        booking={{ booking_number: d.booking_number, service_type: d.service_type, event_date: d.event_date }}
        settings={settings.data}
        submitting={create.isPending ? intent : null}
        errorMessage={error}
        fieldErrors={fieldErrors}
        notice={error && !Object.keys(fieldErrors).length ? <Alert tone="info">Nothing was saved. Your entries are still here.</Alert> : null}
        cancelTo={bookingPath}
        onSubmit={submit}
      />
    </div>
  )
}
