import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Modal } from '../ui/Modal'
import { Button, buttonClasses } from '../ui/Button'
import { useDeleteBooking } from '../../hooks/useBookings'
import { useInvoiceForBooking } from '../../hooks/useInvoices'
import { useToast } from '../../contexts/ToastContext'
import { bookingDeleteFailedMessage } from '../../utils/errors'
import { invoiceDeleteMode } from '../../utils/invoiceStatus'
import type { BookingSummary } from '../../types/booking'

interface Props {
  booking: Pick<BookingSummary, 'id' | 'booking_number'>
  onClose: () => void
  onDeleted?: () => void
}

/** Confirm + delete a booking, taking a draft/cancelled invoice with it (after saying so). */
export function DeleteBookingDialog({ booking, onClose, onDeleted }: Props) {
  const toast = useToast()
  const remove = useDeleteBooking()
  const invoiceQuery = useInvoiceForBooking(booking.id)
  const invoice = invoiceQuery.data ?? null
  const mode = invoice ? invoiceDeleteMode(invoice) : null

  function doDelete() {
    remove.mutate({ id: booking.id, deleteInvoice: mode === 'delete' }, {
      onSuccess: () => { toast.success(mode === 'delete' ? 'Booking and invoice deleted.' : 'Booking deleted.'); onDeleted?.(); onClose() },
      onError: (e) => { onClose(); toast.error(bookingDeleteFailedMessage(e)) },
    })
  }

  // An issued or paid invoice must be dealt with first; point the owner at it.
  if (invoice && mode !== 'delete') {
    return (
      <Modal title="Delete the invoice first" description={`${booking.booking_number} has invoice ${invoice.invoice_number}. Invoices that were issued or paid are financial records, so delete or cancel the invoice first, then come back to delete this booking.`} onClose={onClose} role="alertdialog">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} data-autofocus>Close</Button>
          <Link to={`/dashboard/invoices/${invoice.id}`} className={buttonClasses('primary')}>Go to invoice</Link>
        </div>
      </Modal>
    )
  }

  const alsoInvoice = invoice && mode === 'delete'
  return (
    <ConfirmDialog
      title="Delete booking?"
      description={`This will permanently delete ${booking.booking_number}${alsoInvoice ? ` and its ${invoice.status === 'DRAFT' ? 'draft' : 'cancelled'} invoice ${invoice.invoice_number}` : ''}, and remove its Google Calendar event. This can't be undone.`}
      cancelLabel="Keep Booking"
      confirmLabel={alsoInvoice ? 'Delete Both' : 'Delete Booking'}
      loading={remove.isPending || invoiceQuery.isLoading}
      onCancel={onClose}
      onConfirm={doDelete}
    />
  )
}
