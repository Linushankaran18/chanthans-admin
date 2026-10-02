import {
  Ban,
  CalendarCheck,
  CheckCheck,
  Clock,
  Inbox,
  PackageCheck,
  Pencil,
  Camera,
  type LucideIcon,
} from 'lucide-react'
import type { BookingStatus } from '../types/booking'

export interface StatusMeta {
  label: string
  icon: LucideIcon
  /** Pill classes: soft background + AA-contrast text + border */
  pill: string
  /** Toast shown after moving a booking to this status. */
  toast: string
  /** Verb phrase for the action button, e.g. "Confirm booking". */
  action: string
}

export const STATUS_META: Record<BookingStatus, StatusMeta> = {
  INQUIRY: { label: 'Inquiry', icon: Inbox, pill: 'bg-[#eef0f4] text-[#3b4252] border-[#d9dde6]', toast: 'Booking moved to inquiry.', action: 'Mark as inquiry' },
  PENDING: { label: 'Pending', icon: Clock, pill: 'bg-[#fdf3dc] text-[#7a4b00] border-[#f2dca6]', toast: 'Booking marked as pending.', action: 'Mark as pending' },
  CONFIRMED: { label: 'Confirmed', icon: CalendarCheck, pill: 'bg-success-soft text-success border-[#bfe3cf]', toast: 'Booking confirmed.', action: 'Confirm booking' },
  SHOOT_COMPLETED: { label: 'Shoot completed', icon: Camera, pill: 'bg-[#e6f1fb] text-[#17508f] border-[#bcd8f3]', toast: 'Shoot marked as completed.', action: 'Mark shoot completed' },
  EDITING: { label: 'Editing', icon: Pencil, pill: 'bg-[#f3eafa] text-brand-aubergine border-[#dcc7ee]', toast: 'Booking marked as editing.', action: 'Start editing' },
  READY: { label: 'Ready', icon: PackageCheck, pill: 'bg-[#e1f5f8] text-[#0b5d6e] border-[#b5e2ea]', toast: 'Booking is ready for delivery.', action: 'Mark ready for delivery' },
  DELIVERED: { label: 'Delivered', icon: CheckCheck, pill: 'bg-ink text-white border-ink', toast: 'Booking delivered.', action: 'Mark as delivered' },
  CANCELLED: { label: 'Cancelled', icon: Ban, pill: 'bg-danger-soft text-danger border-[#f0c9cf]', toast: 'Booking cancelled.', action: 'Cancel booking' },
}

/** Normal workflow order used by the progress timeline. */
export const TIMELINE_STEPS: BookingStatus[] = [
  'INQUIRY',
  'PENDING',
  'CONFIRMED',
  'SHOOT_COMPLETED',
  'EDITING',
  'READY',
  'DELIVERED',
]

export function statusLabel(status: BookingStatus): string {
  return STATUS_META[status]?.label ?? status
}

/** Statuses that count as "active" in the pipeline (not terminal-cancelled). */
export function isCancelled(status: BookingStatus): boolean {
  return status === 'CANCELLED'
}
