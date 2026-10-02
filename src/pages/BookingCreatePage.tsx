import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { BookingForm } from '../components/bookings/BookingForm'
import { EMPTY_BOOKING_FORM, type BookingFormValues } from '../components/bookings/bookingSchema'
import { formToInput } from '../components/bookings/bookingMapping'
import { useCreateBooking, useServiceTypes } from '../hooks/useBookings'
import { useToast } from '../contexts/ToastContext'
import { actionFailedMessage, fieldErrorsFrom422, getBookingConflict } from '../utils/errors'
import type { BookingConflictItem } from '../types/booking'

export default function BookingCreatePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const create = useCreateBooking()
  const serviceTypes = useServiceTypes()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [conflicts, setConflicts] = useState<BookingConflictItem[] | null>(null)

  function submit(values: BookingFormValues) {
    setError(null); setConflicts(null); setFieldErrors({})
    create.mutate(formToInput(values, true), {
      onSuccess: (b) => {
        toast.success('Booking created successfully.')
        navigate(`/dashboard/bookings/${b.id}`, { replace: true })
      },
      onError: (e) => {
        const conflict = getBookingConflict(e)
        if (conflict) { setConflicts(conflict.conflicts); return }
        const fe = fieldErrorsFrom422(e)
        setFieldErrors(fe)
        setError(actionFailedMessage(e, 'create the booking'))
      },
    })
  }

  return (
    <div className="animate-fade-up">
      <PageHeader back={{ to: '/dashboard/bookings', label: 'All bookings' }} eyebrow="Bookings" title="New booking" description="Capture the details now — you can refine them any time." />
      <BookingForm
        mode="create"
        defaultValues={EMPTY_BOOKING_FORM}
        serviceTypes={serviceTypes.data ?? []}
        submitting={create.isPending}
        errorMessage={error}
        fieldErrors={fieldErrors}
        conflicts={conflicts}
        cancelTo="/dashboard/bookings"
        onSubmit={submit}
      />
    </div>
  )
}
