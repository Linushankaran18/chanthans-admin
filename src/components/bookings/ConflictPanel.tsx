import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import type { BookingConflictItem } from '../../types/booking'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDate, formatTimeRange } from '../../utils/format'

interface Props {
  conflicts: BookingConflictItem[]
  onChangeTime: () => void
  className?: string
}

export function ConflictPanel({ conflicts, onChangeTime, className = '' }: Props) {
  const first = conflicts[0]
  return (
    <section role="alert" aria-labelledby="conflict-title" className={`rounded-2xl border border-[#f2dca6] bg-[#fdf3dc] p-5 text-[#5c3800] ${className}`}>
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-1 h-6 w-6 shrink-0 text-[#7a4b00]" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="conflict-title" className="font-display text-3xl font-normal leading-tight">Scheduling conflict</h2>
          <p className="mt-1 text-sm">
            {conflicts.length > 1 ? 'These confirmed bookings overlap' : 'Another confirmed booking overlaps'} with this time. Pick a different time, or review the existing {conflicts.length > 1 ? 'bookings' : 'booking'} first.
          </p>
          <ul className="mt-4 space-y-2">
            {conflicts.map((c) => (
              <li key={c.id}>
                <Link to={`/dashboard/bookings/${c.id}`} className="block rounded-xl border border-[#f2dca6] bg-white p-3.5 text-ink transition-colors hover:border-accent/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 truncate font-medium">{c.customer_name}</p>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <p className="mt-0.5 text-sm text-ink-soft">{c.booking_number} · {c.service_type}</p>
                  <p className="text-sm text-ink-soft">{formatDate(c.event_date)} · {formatTimeRange(c.start_time, c.end_time)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {first && (
              <Link
                to={`/dashboard/bookings/${first.id}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line-strong bg-white px-6 text-sm font-medium tracking-wide text-ink transition-all duration-300 ease-lux hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
              >
                View Existing Booking
              </Link>
            )}
            <Button onClick={onChangeTime}>Change Time</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
