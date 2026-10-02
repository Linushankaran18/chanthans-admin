import { ChevronDown } from 'lucide-react'
import type { Booking, BookingStatus } from '../../types/booking'
import { STATUS_META } from '../../utils/bookingStatus'
import { DropdownMenu, type MenuItem } from '../ui/DropdownMenu'

interface Props {
  booking: Booking
  disabled?: boolean
  onSelect: (status: BookingStatus) => void
}

/** Offers only the backend-provided allowed_next_statuses. Renders nothing for terminal statuses. */
export function StatusChanger({ booking, disabled, onSelect }: Props) {
  const allowed = booking.allowed_next_statuses ?? []
  if (allowed.length === 0) return null
  const items: MenuItem[] = [...allowed]
    .sort((a, b) => Number(a === 'CANCELLED') - Number(b === 'CANCELLED'))
    .map((s) => ({
      label: STATUS_META[s].action,
      icon: STATUS_META[s].icon,
      danger: s === 'CANCELLED',
      disabled,
      onSelect: () => onSelect(s),
    }))
  return (
    <DropdownMenu
      label="Change status"
      items={items}
      trigger={<>Change status <ChevronDown className="h-4 w-4" aria-hidden /></>}
      triggerClassName="border border-line-strong bg-white px-5 text-ink hover:border-accent/50 hover:text-accent"
    />
  )
}
