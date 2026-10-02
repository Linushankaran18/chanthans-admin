import type { BookingStatus } from '../../types/booking'
import { STATUS_META } from '../../utils/bookingStatus'

/** Booking status as icon + text (never colour alone). */
export function StatusBadge({ status, size = 'md' }: { status: BookingStatus; size?: 'sm' | 'md' }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium ${meta.pill} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-[0.8rem]'
      }`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {meta.label}
    </span>
  )
}
