import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, CreditCard, NotebookPen, PackageCheck, Tag, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BookingConflictItem, BookingStatus } from '../../types/booking'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { DateField, TimeField } from '../ui/DateField'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { TextField } from '../ui/TextField'
import { STATUS_META } from '../../utils/bookingStatus'
import { parseAmount } from '../../utils/format'
import { ConflictPanel } from './ConflictPanel'
import { PaymentSummary } from './PaymentSummary'
import { SERVICE_SUGGESTIONS, bookingSchema, type BookingFormValues } from './bookingSchema'

interface Props {
  mode: 'create' | 'edit'
  defaultValues: BookingFormValues
  serviceTypes: string[]
  submitting: boolean
  errorMessage: string | null
  fieldErrors?: Record<string, string>
  conflicts: BookingConflictItem[] | null
  cancelTo: string
  onSubmit: (values: BookingFormValues) => void
  /** Re-submit the last values while accepting the overlap. */
  onOverride?: () => void
}

const CREATE_STATUSES: BookingStatus[] = ['INQUIRY', 'PENDING', 'CONFIRMED']

function Section({ title, icon, children, description }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) {
  return (
    <Card as="section">
      <CardHeader title={title} icon={icon} />
      {description && <p className="-mt-2 mb-4 text-sm text-ink-soft">{description}</p>}
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </Card>
  )
}

export function BookingForm({ mode, defaultValues, serviceTypes, submitting, errorMessage, fieldErrors = {}, conflicts, cancelTo, onSubmit, onOverride }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setFocus,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<BookingFormValues>({ resolver: zodResolver(bookingSchema), defaultValues, mode: 'onTouched' })

  const total = watch('total_amount')
  const deposit = watch('deposit_amount')
  const start = watch('start_time')
  const end = watch('end_time')
  const status = watch('status')

  // Cross-field rules should re-evaluate live.
  useEffect(() => {
    if (touchedFields.deposit_amount || isSubmitted) void trigger('deposit_amount')
  }, [total, deposit, trigger, touchedFields.deposit_amount, isSubmitted])
  useEffect(() => {
    if (touchedFields.end_time || isSubmitted) void trigger('end_time')
  }, [start, end, trigger, touchedFields.end_time, isSubmitted])

  const totalN = parseAmount(total)
  const depositN = parseAmount(deposit)
  const depositInvalid = !!errors.deposit_amount || !!errors.total_amount || (totalN !== null && depositN !== null && depositN > totalN)

  const err = (k: keyof BookingFormValues) => errors[k]?.message ?? fieldErrors[k]
  const services = Array.from(new Set([...SERVICE_SUGGESTIONS, ...serviceTypes])).sort((a, b) => (a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)))

  function changeTime() {
    setFocus('start_time')
    document.getElementById('booking-session')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errorMessage && <Alert>{errorMessage}</Alert>}
      {conflicts && conflicts.length > 0 && <ConflictPanel conflicts={conflicts} onChangeTime={changeTime} onOverride={onOverride} overriding={submitting} />}

      <Section title="Client" icon={User}>
        <div className="sm:col-span-2">
          <TextField label="Customer name" autoComplete="off" maxLength={200} error={err('customer_name')} {...register('customer_name')} />
        </div>
        <TextField label="Phone" type="tel" inputMode="tel" autoComplete="off" error={err('customer_phone')} {...register('customer_phone')} />
        <div>
          <TextField label="Email (optional)" type="email" inputMode="email" autoComplete="off" error={err('customer_email')} {...register('customer_email')} />
        </div>
      </Section>

      <div id="booking-session" className="scroll-mt-24">
        <Section title="Session" icon={CalendarDays}>
          <div className="sm:col-span-2">
            <TextField label="Service type" list="booking-service-types" autoComplete="off" maxLength={100} hint="Pick a suggestion or type your own." error={err('service_type')} {...register('service_type')} />
            <datalist id="booking-service-types">{services.map((s) => <option key={s} value={s} />)}</datalist>
          </div>
          <div className="sm:col-span-2">
            <DateField label="Event date" error={err('event_date')} {...register('event_date')} />
          </div>
          <TimeField label="Start time" error={err('start_time')} {...register('start_time')} />
          <TimeField label="End time" error={err('end_time')} {...register('end_time')} />
          <div className="sm:col-span-2">
            <TextField label="Location (optional)" autoComplete="off" maxLength={300} placeholder="Venue or address" error={err('location')} {...register('location')} />
          </div>
        </Section>
      </div>

      <Card as="section">
        <CardHeader title="Payment" icon={CreditCard} />
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,18rem)]">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Total amount (optional)" inputMode="decimal" autoComplete="off" placeholder="0.00" error={err('total_amount')} {...register('total_amount')} />
            <TextField label="Deposit (optional)" inputMode="decimal" autoComplete="off" placeholder="0.00" error={err('deposit_amount')} {...register('deposit_amount')} />
          </div>
          <PaymentSummary total={totalN} deposit={depositN} invalid={depositInvalid} />
        </div>
      </Card>

      <Section title="Delivery" icon={PackageCheck}>
        <DateField label="Delivery due date" optional hint="When the finished photos are promised." error={err('delivery_due_date')} {...register('delivery_due_date')} />
      </Section>

      {mode === 'create' && (
        <Section title="Status" icon={Tag}>
          <div className="sm:col-span-2">
            <Select
              label="Starting status"
              error={err('status')}
              hint={status === 'CONFIRMED' ? 'Confirming checks for overlapping bookings and adds this to Google Calendar.' : 'You can move it forward at any time from the booking page.'}
              {...register('status')}
            >
              {CREATE_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </Select>
          </div>
        </Section>
      )}

      <Card as="section">
        <CardHeader title="Notes" icon={NotebookPen} />
        <Textarea label="Notes" optional hint="Visible to you only — never shared with the client." maxLength={5000} error={err('notes')} {...register('notes')} />
      </Card>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-col-reverse gap-3 border-t border-line bg-cream/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Link
          to={cancelTo}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line-strong bg-white px-6 text-sm font-medium tracking-wide text-ink transition-all duration-300 ease-lux hover:border-accent/50 hover:text-accent"
        >
          Cancel
        </Link>
        <Button type="submit" loading={submitting}>{mode === 'create' ? 'Create booking' : 'Save changes'}</Button>
      </div>
    </form>
  )
}
