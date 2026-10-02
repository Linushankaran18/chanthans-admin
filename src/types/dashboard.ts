import type { BookingStatus, BookingSummary } from './booking'

export interface DashboardSummary {
  today: string
  timezone: string
  today_count: number
  today_bookings: BookingSummary[]
  next_booking: BookingSummary | null
  upcoming_count: number
  upcoming: BookingSummary[]
  status_counts: Record<BookingStatus, number>
  ready_for_delivery_count: number
}
