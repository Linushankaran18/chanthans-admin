import type { Booking, BookingInput } from '../../types/booking'
import { parseAmount, toTimeInput } from '../../utils/format'
import type { BookingFormValues } from './bookingSchema'

export function bookingToForm(b: Booking): BookingFormValues {
  return {
    customer_name: b.customer_name,
    customer_email: b.customer_email ?? '',
    customer_phone: b.customer_phone,
    service_type: b.service_type,
    event_date: b.event_date,
    start_time: toTimeInput(b.start_time),
    end_time: toTimeInput(b.end_time),
    location: b.location ?? '',
    status: b.status,
    total_amount: b.total_amount === null ? '' : String(b.total_amount),
    deposit_amount: b.deposit_amount === null ? '' : String(b.deposit_amount),
    delivery_due_date: b.delivery_due_date ?? '',
    notes: b.notes ?? '',
  }
}

/** Form strings -> API payload. Empty optionals become null so edits can clear them. */
export function formToInput(v: BookingFormValues, includeStatus: boolean, allowOverlap = false): BookingInput {
  const input: BookingInput = {
    customer_name: v.customer_name.trim(),
    customer_email: v.customer_email.trim() || null,
    customer_phone: v.customer_phone.trim(),
    service_type: v.service_type.trim(),
    event_date: v.event_date,
    start_time: v.start_time,
    end_time: v.end_time,
    location: v.location.trim() || null,
    total_amount: parseAmount(v.total_amount),
    deposit_amount: parseAmount(v.deposit_amount),
    delivery_due_date: v.delivery_due_date || null,
    notes: v.notes.trim() || null,
  }
  if (includeStatus) input.status = v.status
  if (allowOverlap) input.allow_overlap = true
  return input
}
