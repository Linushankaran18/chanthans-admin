import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Ban, CalendarDays, CreditCard, FileText, MapPin, MoreHorizontal, Pencil, PackageCheck, SearchX, Trash2, User } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, DetailRow } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/ErrorState'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DropdownMenu, type MenuItem } from '../components/ui/DropdownMenu'
import { buttonClasses } from '../components/ui/Button'
import { Avatar } from '../components/bookings/Avatar'
import { BookingTimeline } from '../components/bookings/BookingTimeline'
import { CalendarSyncCard } from '../components/bookings/CalendarSyncCard'
import { DeleteBookingDialog } from '../components/bookings/DeleteBookingDialog'
import { ShareCard } from '../components/bookings/ShareCard'
import { Button } from '../components/ui/Button'
import { ConflictPanel } from '../components/bookings/ConflictPanel'
import { BookingInvoiceCard } from '../components/invoices/BookingInvoiceCard'
import { PaymentSummary } from '../components/bookings/PaymentSummary'
import { StatusChanger } from '../components/bookings/StatusChanger'
import { useBooking, useChangeBookingStatus } from '../hooks/useBookings'
import { useToast } from '../contexts/ToastContext'
import { actionFailedMessage, getBookingConflict, isNotFound, loadFailedMessage } from '../utils/errors'
import { STATUS_META } from '../utils/bookingStatus'
import { formatDate, formatDateLong, formatTimeRange } from '../utils/format'
import type { BookingConflictItem, BookingStatus } from '../types/booking'

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading booking" className="space-y-6">
      <Skeleton className="h-14 w-2/3 max-w-md" />
      <Skeleton className="h-28 w-full !rounded-2xl" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 !rounded-2xl" />)}</div>
    </div>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const booking = useBooking(id)
  const changeStatus = useChangeBookingStatus()
  const [confirm, setConfirm] = useState<'cancel' | 'delete' | null>(null)
  const [conflicts, setConflicts] = useState<BookingConflictItem[] | null>(null)
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null)

  if (booking.isLoading) return <DetailSkeleton />
  if (booking.isError || !booking.data) {
    if (isNotFound(booking.error)) {
      return <EmptyState icon={SearchX} title="Booking not found" description="It may have been deleted or the link is incorrect." action={<Link to="/dashboard/bookings" className={buttonClasses('primary')}>Back to bookings</Link>} />
    }
    return <ErrorState message={loadFailedMessage(booking.error, 'this booking')} onRetry={() => booking.refetch()} retrying={booking.isFetching} />
  }

  const b = booking.data
  const editPath = `/dashboard/bookings/${b.id}/edit`

  function move(status: BookingStatus, allowOverlap = false) {
    setConflicts(null)
    setPendingStatus(status)
    changeStatus.mutate({ id: b.id, status, allowOverlap }, {
      onSuccess: () => { setConfirm(null); setPendingStatus(null); toast.success(STATUS_META[status].toast) },
      onError: (e) => {
        setConfirm(null)
        const conflict = getBookingConflict(e)
        if (conflict) { setConflicts(conflict.conflicts); return }
        toast.error(actionFailedMessage(e, 'change the status'))
      },
    })
  }

  function onSelectStatus(status: BookingStatus) {
    if (status === 'CANCELLED') setConfirm('cancel')
    else move(status)
  }

  const menu: MenuItem[] = [
    ...(b.allowed_next_statuses.includes('CANCELLED') ? [{ label: 'Cancel booking', icon: Ban, danger: true, onSelect: () => setConfirm('cancel') }] : []),
  ]

  const terminal = b.allowed_next_statuses.length === 0

  return (
    <div className="animate-fade-up">
      <PageHeader
        back={{ to: '/dashboard/bookings', label: 'All bookings' }}
        eyebrow={`${b.booking_number} · ${b.service_type}`}
        title={b.customer_name}
        description={<span className="flex flex-wrap items-center gap-x-3 gap-y-2"><StatusBadge status={b.status} /><span>{formatDate(b.event_date)} · {formatTimeRange(b.start_time, b.end_time)}</span></span>}
        actions={
          <>
            <Link to={editPath} className={buttonClasses('secondary')}><Pencil className="h-4 w-4" aria-hidden /> Edit</Link>
            <StatusChanger booking={b} disabled={changeStatus.isPending} onSelect={onSelectStatus} />
            {menu.length > 0 && (
              <DropdownMenu
                label="More actions"
                items={menu}
                trigger={<MoreHorizontal className="h-5 w-5" aria-hidden />}
                triggerClassName="w-11 border border-line-strong bg-white text-ink hover:border-accent/50 hover:text-accent"
              />
            )}
            <Button variant="danger" onClick={() => setConfirm('delete')}><Trash2 className="h-4 w-4" aria-hidden /> Delete</Button>
          </>
        }
      />

      {conflicts && conflicts.length > 0 && <ConflictPanel className="mb-6" conflicts={conflicts} onChangeTime={() => navigate(editPath)} onOverride={pendingStatus ? () => move(pendingStatus, true) : undefined} overriding={changeStatus.isPending} />}

      <Card as="section" className="mb-6">
        <CardHeader title="Progress" icon={PackageCheck} />
        <BookingTimeline status={b.status} />
        {terminal && b.status !== 'CANCELLED' && <p className="mt-4 text-sm text-ink-soft">This booking is complete — there are no further steps.</p>}
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card as="section">
          <CardHeader title="Client" icon={User} />
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={b.customer_name} size="lg" />
            <p className="min-w-0 break-words font-display text-2xl leading-tight">{b.customer_name}</p>
          </div>
          <dl className="space-y-3">
            <DetailRow label="Phone"><a href={`tel:${b.customer_phone}`} className="text-accent hover:underline">{b.customer_phone}</a></DetailRow>
            <DetailRow label="Email">{b.customer_email ? <a href={`mailto:${b.customer_email}`} className="text-accent hover:underline">{b.customer_email}</a> : <span className="font-normal text-ink-mute">Not provided</span>}</DetailRow>
          </dl>
        </Card>

        <Card as="section">
          <CardHeader title="Schedule" icon={CalendarDays} />
          <dl className="space-y-3">
            <DetailRow label="Date">{formatDateLong(b.event_date)}</DetailRow>
            <DetailRow label="Time">{formatTimeRange(b.start_time, b.end_time)}</DetailRow>
            <DetailRow label="Service">{b.service_type}</DetailRow>
          </dl>
        </Card>

        <Card as="section">
          <CardHeader title="Location" icon={MapPin} />
          {b.location ? <p className="break-words text-sm font-medium">{b.location}</p> : <p className="text-sm text-ink-mute">No location added.</p>}
        </Card>

        <Card as="section">
          <CardHeader title="Payment" icon={CreditCard} />
          <PaymentSummary total={b.total_amount} deposit={b.deposit_amount} />
        </Card>

        <BookingInvoiceCard bookingId={b.id} />

        <Card as="section">
          <CardHeader title="Delivery" icon={PackageCheck} />
          <dl><DetailRow label="Due date">{b.delivery_due_date ? formatDate(b.delivery_due_date) : <span className="font-normal text-ink-mute">Not set</span>}</DetailRow></dl>
        </Card>

        <CalendarSyncCard booking={b} />

        <ShareCard booking={b} />

        <Card as="section" className="md:col-span-2">
          <CardHeader title="Notes" icon={FileText} />
          {b.notes ? <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft">{b.notes}</p> : <p className="text-sm text-ink-mute">No notes yet.</p>}
        </Card>
      </div>

      {confirm === 'cancel' && (
        <ConfirmDialog
          title="Cancel booking?"
          description={`This will cancel ${b.booking_number} and remove its scheduled Google Calendar event.`}
          cancelLabel="Keep Booking"
          confirmLabel="Cancel Booking"
          loading={changeStatus.isPending}
          onCancel={() => setConfirm(null)}
          onConfirm={() => move('CANCELLED')}
        />
      )}
      {confirm === 'delete' && (
        <DeleteBookingDialog booking={b} onClose={() => setConfirm(null)} onDeleted={() => navigate('/dashboard/bookings', { replace: true })} />
      )}
    </div>
  )
}
