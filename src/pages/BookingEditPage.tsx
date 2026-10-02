import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/ErrorState'
import { EmptyState } from '../components/ui/EmptyState'
import { buttonClasses } from '../components/ui/Button'
import { BookingForm } from '../components/bookings/BookingForm'
import { bookingToForm, formToInput } from '../components/bookings/bookingMapping'
import type { BookingFormValues } from '../components/bookings/bookingSchema'
import { useBooking, useServiceTypes, useUpdateBooking } from '../hooks/useBookings'
import { useToast } from '../contexts/ToastContext'
import { actionFailedMessage, fieldErrorsFrom422, getBookingConflict, isNotFound, loadFailedMessage } from '../utils/errors'
import type { BookingConflictItem } from '../types/booking'

export default function BookingEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const booking = useBooking(id)
  const update = useUpdateBooking()
  const serviceTypes = useServiceTypes()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [conflicts, setConflicts] = useState<BookingConflictItem[] | null>(null)

  const detailPath = `/dashboard/bookings/${id}`

  if (booking.isLoading) {
    return (
      <div role="status" aria-label="Loading booking" className="space-y-5">
        <Skeleton className="h-12 w-64" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 w-full !rounded-2xl" />)}
      </div>
    )
  }
  if (booking.isError || !booking.data) {
    if (isNotFound(booking.error)) {
      return <EmptyState icon={SearchX} title="Booking not found" description="It may have been deleted." action={<Link to="/dashboard/bookings" className={buttonClasses('primary')}>Back to bookings</Link>} />
    }
    return <ErrorState message={loadFailedMessage(booking.error, 'this booking')} onRetry={() => booking.refetch()} retrying={booking.isFetching} />
  }

  const b = booking.data

  function submit(values: BookingFormValues) {
    setError(null); setConflicts(null); setFieldErrors({})
    update.mutate({ id: b.id, input: formToInput(values, false) }, {
      onSuccess: () => {
        toast.success('Booking updated.')
        navigate(detailPath, { replace: true })
      },
      onError: (e) => {
        const conflict = getBookingConflict(e)
        if (conflict) { setConflicts(conflict.conflicts); return }
        setFieldErrors(fieldErrorsFrom422(e))
        setError(actionFailedMessage(e, 'save your changes'))
      },
    })
  }

  return (
    <div className="animate-fade-up">
      <PageHeader back={{ to: detailPath, label: b.booking_number }} eyebrow={b.booking_number} title="Edit booking" description={`${b.customer_name} · ${b.service_type}`} />
      <BookingForm
        mode="edit"
        defaultValues={bookingToForm(b)}
        serviceTypes={serviceTypes.data ?? []}
        submitting={update.isPending}
        errorMessage={error}
        fieldErrors={fieldErrors}
        conflicts={conflicts}
        cancelTo={detailPath}
        onSubmit={submit}
      />
    </div>
  )
}
