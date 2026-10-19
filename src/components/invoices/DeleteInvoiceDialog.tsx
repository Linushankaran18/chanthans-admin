import { useState } from 'react'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useChangeInvoiceStatus, useDeleteInvoice } from '../../hooks/useInvoices'
import { useToast } from '../../contexts/ToastContext'
import { invoiceActionFailedMessage } from '../../utils/errors'
import { invoiceDeleteMode } from '../../utils/invoiceStatus'
import type { InvoiceSummary } from '../../types/invoice'

interface Props {
  invoice: Pick<InvoiceSummary, 'id' | 'invoice_number' | 'booking_id' | 'status' | 'amount_paid'>
  onClose: () => void
  onDeleted?: () => void
}

/** Confirm + delete an invoice. Issued (unpaid) invoices are cancelled first, in the same step. */
export function DeleteInvoiceDialog({ invoice, onClose, onDeleted }: Props) {
  const toast = useToast()
  const changeStatus = useChangeInvoiceStatus()
  const remove = useDeleteInvoice()
  const [busy, setBusy] = useState(false)
  const mode = invoiceDeleteMode(invoice)

  async function confirm() {
    setBusy(true)
    try {
      if (mode === 'cancel_then_delete') await changeStatus.mutateAsync({ id: invoice.id, status: 'CANCELLED' })
      await remove.mutateAsync({ id: invoice.id, bookingId: invoice.booking_id })
      toast.success('Invoice deleted.')
      onDeleted?.()
      onClose()
    } catch (e) {
      toast.error(invoiceActionFailedMessage(e, 'delete the invoice'))
      onClose()
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'blocked') {
    return (
      <ConfirmDialog
        title="Can't delete this invoice"
        description={`${invoice.invoice_number} has payments recorded, so it is kept as a financial record. Cancel it instead if it is no longer valid.`}
        cancelLabel="Close"
        confirmLabel="OK"
        confirmVariant="primary"
        onCancel={onClose}
        onConfirm={onClose}
      />
    )
  }

  return (
    <ConfirmDialog
      title="Delete invoice?"
      description={
        mode === 'cancel_then_delete'
          ? `${invoice.invoice_number} has been issued. It will be cancelled and then permanently deleted. The booking stays, and you can create a new invoice for it. This can't be undone.`
          : `This permanently deletes ${invoice.invoice_number}. The booking stays, and you can create a new invoice for it. This can't be undone.`
      }
      cancelLabel="Keep Invoice"
      confirmLabel="Delete Invoice"
      loading={busy}
      onCancel={onClose}
      onConfirm={confirm}
    />
  )
}
