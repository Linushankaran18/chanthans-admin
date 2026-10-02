import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import type { BookingSummary } from '../../types/booking'
import { StatusBadge } from '../ui/StatusBadge'
import { dateTileParts, formatRelativeDay, formatTimeRange } from '../../utils/format'

/** Schedule rows: date tile, time, customer, service · location, status. */
export function ScheduleList({ bookings, today, showDay = true }: { bookings: BookingSummary[]; today: string; showDay?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {bookings.map((b) => {
        const tile = dateTileParts(b.event_date)
        return (
          <li key={b.id}>
            <Link
              to={`/dashboard/bookings/${b.id}`}
              className="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-cream focus-visible:ring-offset-0"
            >
              {showDay && (
                <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f5effb] text-accent" aria-hidden>
                  <span className="text-[0.6rem] font-medium uppercase tracking-widest">{tile.month}</span>
                  <span className="font-sans text-xl font-medium leading-none">{tile.day}</span>
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-medium text-accent">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {showDay && <span className="sr-only">{formatRelativeDay(b.event_date, today)}, </span>}
                  {showDay && <span className="hidden sm:inline">{formatRelativeDay(b.event_date, today)} · </span>}
                  {formatTimeRange(b.start_time, b.end_time)}
                </p>
                <p className="truncate font-medium text-ink group-hover:text-accent">{b.customer_name}</p>
                <p className="flex items-center gap-1 truncate text-sm text-ink-soft">
                  <span className="truncate">{b.service_type}</span>
                  {b.location && (<><span aria-hidden>·</span><MapPin className="h-3 w-3 shrink-0 text-ink-mute" aria-hidden /><span className="truncate">{b.location}</span></>)}
                </p>
              </div>
              <div className="shrink-0"><StatusBadge status={b.status} size="sm" /></div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
