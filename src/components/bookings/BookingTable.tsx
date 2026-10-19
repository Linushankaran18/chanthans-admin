import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Trash2 } from 'lucide-react'
import type { BookingSummary } from '../../types/booking'
import { StatusBadge } from '../ui/StatusBadge'
import { Avatar } from './Avatar'
import { DeleteBookingDialog } from './DeleteBookingDialog'
import { formatDate, formatMoney, formatTimeRange } from '../../utils/format'

const th = 'px-4 py-3 text-left text-[0.66rem] font-medium uppercase tracking-[0.2em] text-ink-mute'

export function BookingTable({ bookings }: { bookings: BookingSummary[] }) {
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">Bookings</caption>
        <thead className="border-b border-line bg-cream/70">
          <tr>
            <th scope="col" className={`${th} w-[23%]`}>Customer</th>
            <th scope="col" className={`${th} w-[15%]`}>Service</th>
            <th scope="col" className={`${th} w-[16%]`}>Date &amp; time</th>
            <th scope="col" className={`${th} w-[16%]`}>Status</th>
            <th scope="col" className={`${th} w-[17%]`}>Paid / total</th>
            <th scope="col" className={`${th} w-[12%]`}><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {bookings.map((b) => <BookingRow key={b.id} booking={b} />)}
        </tbody>
      </table>
    </div>
  )
}

export function BookingRow({ booking: b }: { booking: BookingSummary }) {
  const navigate = useNavigate()
  const href = `/dashboard/bookings/${b.id}`
  const [deleting, setDeleting] = useState(false)
  return (
    <tr
      onClick={(e) => { if (!(e.target as HTMLElement).closest('a,button')) navigate(href) }}
      className="group cursor-pointer transition-colors hover:bg-cream/70"
    >
      <td className="px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={b.customer_name} />
          <div className="min-w-0">
            <Link to={href} className="block truncate rounded font-medium text-ink hover:text-accent" title={b.customer_name}>{b.customer_name}</Link>
            <p className="truncate text-xs text-ink-mute">{b.booking_number}</p>
          </div>
        </div>
      </td>
      <td className="truncate px-4 py-3.5 text-sm text-ink-soft" title={b.service_type}>{b.service_type}</td>
      <td className="px-4 py-3.5 text-sm">
        <p className="font-medium text-ink">{formatDate(b.event_date)}</p>
        <p className="text-xs text-ink-mute">{formatTimeRange(b.start_time, b.end_time)}</p>
      </td>
      <td className="px-4 py-3.5"><StatusBadge status={b.status} size="sm" /></td>
      <td className="px-4 py-3.5 text-sm text-ink-soft">
        <span className="font-medium text-ink">{formatMoney(b.deposit_amount ?? 0)}</span>
        <span className="text-ink-mute"> / {formatMoney(b.total_amount)}</span>
      </td>
      <td className="px-2 py-3.5 text-right">
        <button type="button" onClick={() => setDeleting(true)} aria-label={`Delete booking ${b.booking_number} for ${b.customer_name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-mute transition-all hover:bg-danger-soft hover:text-danger">
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
        {deleting && <div onClick={(e) => e.stopPropagation()}><DeleteBookingDialog booking={b} onClose={() => setDeleting(false)} /></div>}
        <Link to={href} aria-label={`View booking ${b.booking_number} for ${b.customer_name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-mute transition-all hover:bg-cream-deep hover:text-accent">
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </td>
    </tr>
  )
}
