export const BOOKING_STATUSES = [
  'INQUIRY',
  'PENDING',
  'CONFIRMED',
  'SHOOT_COMPLETED',
  'EDITING',
  'READY',
  'DELIVERED',
  'CANCELLED',
] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export type CalendarSyncStatus = 'NOT_SYNCED' | 'SYNCED' | 'FAILED'

export interface BookingSummary {
  id: string
  booking_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  service_type: string
  /** YYYY-MM-DD, studio-local. Never pass through browser-timezone Date conversion. */
  event_date: string
  /** HH:MM:SS studio-local */
  start_time: string
  end_time: string
  location: string | null
  status: BookingStatus
  total_amount: number | null
  deposit_amount: number | null
  balance_amount: number | null
  delivery_due_date: string | null
  calendar_sync_status: CalendarSyncStatus
  calendar_synced_at: string | null
  calendar_sync_error: string | null
  allowed_next_statuses: BookingStatus[]
  created_at: string
  updated_at: string
}

export interface Booking extends BookingSummary {
  notes: string | null
  google_calendar_event_id: string | null
  /** A team share link is currently active. */
  is_shared: boolean
}

export type BookingSort = 'date_desc' | 'date_asc' | 'created_desc'

export interface BookingListParams {
  status?: BookingStatus[]
  search?: string
  date_from?: string
  date_to?: string
  service_type?: string
  sort?: BookingSort
  page?: number
  page_size?: number
}

export interface BookingListResponse {
  items: BookingSummary[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface BookingInput {
  customer_name: string
  customer_email?: string | null
  customer_phone: string
  service_type: string
  event_date: string
  start_time: string
  end_time: string
  location?: string | null
  status?: BookingStatus
  total_amount?: number | null
  deposit_amount?: number | null
  delivery_due_date?: string | null
  notes?: string | null
  /** Owner accepted overlapping a confirmed booking (never stored). */
  allow_overlap?: boolean
}

export interface BookingConflictItem {
  id: string
  booking_number: string
  customer_name: string
  service_type: string
  event_date: string
  start_time: string
  end_time: string
  status: BookingStatus
}

export interface BookingConflict {
  detail: string
  code: 'booking_conflict'
  conflicts: BookingConflictItem[]
}
