import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Ban, SearchX } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/ErrorState'
import { EmptyState } from '../components/ui/EmptyState'
import { buttonClasses } from '../components/ui/Button'
import { InvoiceForm, type InvoiceSubmitIntent } from '../components/invoices/InvoiceForm'
import { formToInput, invoiceToForm } from '../components/invoices/invoiceMapping'
import type { InvoiceFormValues } from '../components/invoices/invoiceSchema'
import { useChangeInvoiceStatus, useInvoice, useInvoiceSettings, useUpdateInvoice } from '../hooks/useInvoices'
import { useToast } from '../contexts/ToastContext'
import { fieldErrorsFrom422, invoiceActionFailedMessage, isNotFound, loadFailedMessage } from '../utils/errors'

export default function InvoiceEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const invoice = useInvoice(id)
  const settings = useInvoiceSettings()
  const update = useUpdateInvoice()
  const changeStatus = useChangeInvoiceStatus()
  const [intent, setIntent] = useState<InvoiceSubmitIntent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const detailPath = `/dashboard/invoices/${id}`

  if (invoice.isLoading) {
    return (
      <div role="status" aria-label="Loading invoice" className="space-y-5">
        <Skeleton className="h-12 w-64" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 w-full !rounded-2xl" />)}
      </div>
    )
  }
  if (invoice.isError || !invoice.data) {
    if (isNotFound(invoice.error)) {
      return <EmptyState icon={SearchX} title="Invoice not found" description="It may have been deleted." action={<Link to="/dashboard/invoices" className={buttonClasses('primary')}>Back to invoices</Link>} />
    }
    return <ErrorState message={loadFailedMessage(invoice.error, 'this invoice')} onRetry={() => invoice.refetch()} retrying={invoice.isFetching} />
  }

  const inv = invoice.data
  if (inv.status === 'CANCELLED') {
    return <EmptyState icon={Ban} title="Cancelled invoices can't be edited" description="Open the invoice to view or download it." action={<Link to={detailPath} className={buttonClasses('primary')}>View invoice</Link>} />
  }

  function submit(values: InvoiceFormValues, which: InvoiceSubmitIntent) {
    setError(null); setFieldErrors({}); setIntent(which)
    update.mutate({ id: inv.id, input: formToInput(values) }, {
      onSuccess: (saved) => {
        if (which !== 'issue') {
          toast.success('Invoice updated.')
          navigate(detailPath, { replace: true })
          return
        }
        changeStatus.mutate({ id: saved.id, status: 'ISSUED' }, {
          onSuccess: () => { toast.success(`Invoice ${saved.invoice_number} issued.`); navigate(detailPath, { replace: true }) },
          onError: (e) => { setIntent(null); setError(invoiceActionFailedMessage(e, 'issue the invoice')) },
        })
      },
      onError: (e) => {
        setIntent(null)
        setFieldErrors(fieldErrorsFrom422(e))
        setError(invoiceActionFailedMessage(e, 'save your changes'))
      },
    })
  }

  return (
    <div className="animate-fade-up">
      <PageHeader back={{ to: detailPath, label: inv.invoice_number }} eyebrow={inv.invoice_number} title="Edit invoice" description={`${inv.customer_name} · ${inv.booking_number}`} />
      <InvoiceForm
        mode="edit"
        defaultValues={invoiceToForm(inv)}
        invoiceNumber={inv.invoice_number}
        status={inv.status}
        booking={{ booking_number: inv.booking_number, service_type: inv.service_type, event_date: inv.event_date }}
        settings={settings.data}
        submitting={update.isPending || changeStatus.isPending ? intent : null}
        errorMessage={error}
        fieldErrors={fieldErrors}
        cancelTo={detailPath}
        onSubmit={submit}
      />
    </div>
  )
}
