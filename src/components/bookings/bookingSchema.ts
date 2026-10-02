import { z } from 'zod'
import { BOOKING_STATUSES } from '../../types/booking'
import { parseAmount } from '../../utils/format'

const optionalAmount = z.string().superRefine((v, ctx) => {
  if (!v.trim()) return
  const n = parseAmount(v)
  if (n === null) ctx.addIssue({ code: 'custom', message: 'Enter a valid amount, like 450 or 450.00.' })
  else if (n < 0) ctx.addIssue({ code: 'custom', message: 'Amount cannot be negative.' })
  else if (n > 9_999_999_999) ctx.addIssue({ code: 'custom', message: 'That amount is too large.' })
})

export const SERVICE_SUGGESTIONS = ['Wedding', 'Engagement', 'Portrait', 'Family', 'Birthday', 'Corporate', 'Maternity', 'Newborn', 'Event', 'Other']

export const bookingSchema = z
  .object({
    customer_name: z.string().trim().min(1, 'Customer name is required.').max(200, 'Customer name is too long.'),
    customer_email: z.string().trim().max(254, 'Email is too long.').refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address.'),
    customer_phone: z.string().trim().min(1, 'Phone number is required.').max(40, 'Phone number is too long.'),
    service_type: z.string().trim().min(1, 'Choose or enter a service type.').max(100, 'Service type is too long.'),
    event_date: z.string().min(1, 'Event date is required.'),
    start_time: z.string().min(1, 'Start time is required.'),
    end_time: z.string().min(1, 'End time is required.'),
    location: z.string().trim().max(300, 'Location is too long.'),
    status: z.enum(BOOKING_STATUSES),
    total_amount: optionalAmount,
    deposit_amount: optionalAmount,
    delivery_due_date: z.string(),
    notes: z.string().max(5000, 'Notes are too long.'),
  })
  .superRefine((v, ctx) => {
    if (v.start_time && v.end_time && v.end_time <= v.start_time) {
      ctx.addIssue({ code: 'custom', path: ['end_time'], message: 'End time must be later than the start time.' })
    }
    const total = parseAmount(v.total_amount)
    const deposit = parseAmount(v.deposit_amount)
    if (total !== null && deposit !== null && total >= 0 && deposit >= 0 && deposit > total) {
      ctx.addIssue({ code: 'custom', path: ['deposit_amount'], message: 'Deposit cannot be more than the total amount.' })
    }
  })

export type BookingFormValues = z.infer<typeof bookingSchema>

export const EMPTY_BOOKING_FORM: BookingFormValues = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  service_type: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location: '',
  status: 'INQUIRY',
  total_amount: '',
  deposit_amount: '',
  delivery_due_date: '',
  notes: '',
}
