import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Clock, MapPin, Trash2 } from 'lucide-react'
import type { BookingSummary } from '../../types/booking'
import { StatusBadge } from '../ui/StatusBadge'
import { Avatar } from './Avatar'
import { DeleteBookingDialog } from './DeleteBookingDialog'
import { formatDate, formatMoney, formatTimeRange } from '../../utils/format'

/** Mobile list item. Everything but the delete button is one link. */
export function BookingCard({ booking: b }: { booking: BookingSummary }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <div className="card-surface group relative transition-all duration-300 ease-lux hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/dashboard/bookings/${b.id}`} className="block p-4 pb-16 focus-visible:ring-offset-cream">
        <div className="flex items-start gap-3">
          <Avatar name={b.customer_name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{b.customer_name}</p>
            <p className="truncate text-sm text-ink-soft">{b.service_type} · <span className="text-ink-mute">{b.booking_number}</span></p>
          </div>
          <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5" aria-hidden />
        </div>
        <dl className="mt-4 space-y-1.5 text-sm text-ink-soft">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-ink-mute" aria-hidden /><dt className="sr-only">Date</dt><dd>{formatDate(b.event_date)}</dd></div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-ink-mute" aria-hidden /><dt className="sr-only">Time</dt><dd>{formatTimeRange(b.start_time, b.end_time)}</dd></div>
          {b.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-ink-mute" aria-hidden /><dt className="sr-only">Location</dt><dd className="truncate">{b.location}</dd></div>}
        </dl>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <StatusBadge status={b.status} size="sm" />
          <p className="text-sm text-ink-soft">
            <span className="sr-only">Payment: </span>
            <span className="font-medium text-ink">{formatMoney(b.deposit_amount ?? 0)}</span> / {formatMoney(b.total_amount)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => setDeleting(true)}
        aria-label={`Delete booking ${b.booking_number} for ${b.customer_name}`}
        className="absolute bottom-3 right-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
      >
        <Trash2 className="h-4 w-4" aria-hidden /> Delete
      </button>
      {deleting && <DeleteBookingDialog booking={b} onClose={() => setDeleting(false)} />}
    </div>
  )
}
