import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Ban, Banknote, CheckCircle2, Download, Eye, MoreHorizontal, Pencil, Send, SearchX, Trash2, Wallet } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/ErrorState'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DropdownMenu, type MenuItem } from '../components/ui/DropdownMenu'
import { Button, buttonClasses } from '../components/ui/Button'
import { InvoiceDocument, invoiceToDocument } from '../components/invoices/InvoiceDocument'
import { InvoiceStatusBadge } from '../components/invoices/InvoiceStatusBadge'
import { RecordPaymentModal } from '../components/invoices/RecordPaymentModal'
import { DeleteInvoiceDialog } from '../components/invoices/DeleteInvoiceDialog'
import { useChangeInvoiceStatus, useInvoice, useInvoiceSettings, useRecordPayment } from '../hooks/useInvoices'
import { useInvoicePdf } from '../hooks/useInvoicePdf'
import { useToast } from '../contexts/ToastContext'
import { invoiceActionFailedMessage, isNotFound, loadFailedMessage } from '../utils/errors'
import { formatMoneyIn } from '../utils/format'
import { displayStatus, invoiceCapabilities } from '../utils/invoiceStatus'

type Dialog = 'paid' | 'payment' | 'cancel' | 'delete' | null

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading invoice" className="space-y-6">
      <Skeleton className="h-14 w-2/3 max-w-md" />
      <Skeleton className="mx-auto h-[640px] w-full max-w-[860px] !rounded-2xl" />
    </div>
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const invoice = useInvoice(id)
  const settings = useInvoiceSettings()
  const changeStatus = useChangeInvoiceStatus()
  const payment = useRecordPayment()
  const pdf = useInvoicePdf(invoice.data)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  if (invoice.isLoading) return <DetailSkeleton />
  if (invoice.isError || !invoice.data) {
    if (isNotFound(invoice.error)) {
      return <EmptyState icon={SearchX} title="Invoice not found" description="It may have been deleted or the link is incorrect." action={<Link to="/dashboard/invoices" className={buttonClasses('primary')}>Back to invoices</Link>} />
    }
    return <ErrorState message={loadFailedMessage(invoice.error, 'this invoice')} onRetry={() => invoice.refetch()} retrying={invoice.isFetching} />
  }

  const inv = invoice.data
  const status = displayStatus(inv)
  const caps = invoiceCapabilities(status)
  const money = (v: number) => formatMoneyIn(v, inv.currency)

  function issue() {
    changeStatus.mutate({ id: inv.id, status: 'ISSUED' }, {
      onSuccess: () => toast.success(`Invoice ${inv.invoice_number} issued.`),
      onError: (e) => toast.error(invoiceActionFailedMessage(e, 'issue the invoice')),
    })
  }
  function cancel() {
    changeStatus.mutate({ id: inv.id, status: 'CANCELLED' }, {
      onSuccess: () => { setDialog(null); toast.success('Invoice cancelled.') },
      onError: (e) => { setDialog(null); toast.error(invoiceActionFailedMessage(e, 'cancel the invoice')) },
    })
  }
  function markPaid() {
    payment.mutate({ id: inv.id, payment: { mark_as_paid: true } }, {
      onSuccess: () => { setDialog(null); toast.success('Invoice marked as paid.') },
      onError: (e) => { setDialog(null); toast.error(invoiceActionFailedMessage(e, 'mark the invoice as paid')) },
    })
  }
  function savePayment(amount: number) {
    setPaymentError(null)
    payment.mutate({ id: inv.id, payment: { amount_paid: amount } }, {
      onSuccess: () => { setDialog(null); toast.success('Payment recorded.') },
      onError: (e) => setPaymentError(invoiceActionFailedMessage(e, 'record the payment')),
    })
  }
  const menu: MenuItem[] = [
    { label: 'Preview PDF', icon: Eye, onSelect: pdf.preview, disabled: pdf.busy !== null },
    ...(caps.canRecordPayment ? [{ label: 'Record payment', icon: Wallet, onSelect: () => { setPaymentError(null); setDialog('payment') } }] : []),
    ...(caps.canCancel ? [{ label: 'Cancel invoice', icon: Ban, danger: true, onSelect: () => setDialog('cancel') }] : []),
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader
        back={{ to: '/dashboard/invoices', label: 'All invoices' }}
        eyebrow={`${inv.booking_number} · ${inv.service_type}`}
        title={inv.invoice_number}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <InvoiceStatusBadge status={status} />
            <span>{inv.customer_name}</span>
            <span className="text-ink-mute">Balance due {money(inv.balance_due)}</span>
          </span>
        }
        actions={
          <>
            {caps.canIssue && <Button onClick={issue} loading={changeStatus.isPending}><Send className="h-4 w-4" aria-hidden /> Issue invoice</Button>}
            {caps.canMarkPaid && <Button onClick={() => setDialog('paid')}><CheckCircle2 className="h-4 w-4" aria-hidden /> Mark as paid</Button>}
            {caps.canEdit && <Link to={`/dashboard/invoices/${inv.id}/edit`} className={buttonClasses('secondary')}><Pencil className="h-4 w-4" aria-hidden /> Edit</Link>}
            <Button variant="secondary" onClick={pdf.download} loading={pdf.busy === 'download'}><Download className="h-4 w-4" aria-hidden /> Download PDF</Button>
            <DropdownMenu
              label="More actions"
              items={menu}
              trigger={<MoreHorizontal className="h-5 w-5" aria-hidden />}
              triggerClassName="w-11 border border-line-strong bg-white text-ink hover:border-accent/50 hover:text-accent"
            />
            <Button variant="danger" onClick={() => setDialog('delete')}><Trash2 className="h-4 w-4" aria-hidden /> Delete</Button>
          </>
        }
      />

      <p className="mb-4 text-sm text-ink-soft">
        <Banknote className="-mt-0.5 mr-1.5 inline h-4 w-4 text-ink-mute" aria-hidden />
        Booking <Link to={`/dashboard/bookings/${inv.booking_id}`} className="font-medium text-accent hover:underline">{inv.booking_number}</Link>
      </p>

      <InvoiceDocument data={invoiceToDocument(inv)} settings={settings.data} />

      {dialog === 'paid' && (
        <ConfirmDialog
          title="Mark as paid?"
          description={`This records ${money(inv.total_amount)} as received on ${inv.invoice_number} and sets the balance due to ${money(0)}.`}
          confirmLabel="Mark as paid"
          confirmVariant="primary"
          loading={payment.isPending}
          onCancel={() => setDialog(null)}
          onConfirm={markPaid}
        />
      )}
      {dialog === 'payment' && (
        <RecordPaymentModal invoice={inv} loading={payment.isPending} error={paymentError} onCancel={() => setDialog(null)} onSave={savePayment} />
      )}
      {dialog === 'cancel' && (
        <ConfirmDialog
          title="Cancel invoice?"
          description={`${inv.invoice_number} will be marked as cancelled and can no longer be edited or take payments.`}
          cancelLabel="Keep Invoice"
          confirmLabel="Cancel Invoice"
          loading={changeStatus.isPending}
          onCancel={() => setDialog(null)}
          onConfirm={cancel}
        />
      )}
      {dialog === 'delete' && (
        <DeleteInvoiceDialog invoice={inv} onClose={() => setDialog(null)} onDeleted={() => navigate('/dashboard/invoices', { replace: true })} />
      )}
    </div>
  )
}
