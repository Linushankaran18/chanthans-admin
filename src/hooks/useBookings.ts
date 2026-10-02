import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeBookingStatus,
  createBooking,
  deleteBooking,
  getBooking,
  listBookings,
  listServiceTypes,
  retryCalendarSync,
  updateBooking,
} from '../api/bookings'
import type { Booking, BookingInput, BookingListParams, BookingStatus } from '../types/booking'
import { DASHBOARD_KEY } from './useDashboard'

export const BOOKINGS_KEY = ['bookings'] as const
export const bookingKeys = {
  lists: () => [...BOOKINGS_KEY, 'list'] as const,
  list: (params: BookingListParams) => [...BOOKINGS_KEY, 'list', params] as const,
  detail: (id: string) => [...BOOKINGS_KEY, 'detail', id] as const,
  serviceTypes: () => [...BOOKINGS_KEY, 'service-types'] as const,
}

export function useBookingList(params: BookingListParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => listBookings(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => getBooking(id as string),
    enabled: !!id,
    retry: (count, error) => {
      const s = (error as { response?: { status?: number } })?.response?.status
      return s !== 404 && count < 1
    },
  })
}

export function useServiceTypes() {
  return useQuery({ queryKey: bookingKeys.serviceTypes(), queryFn: listServiceTypes, staleTime: 5 * 60_000 })
}

/** After any write: refresh lists + dashboard (counts / schedule depend on bookings). */
function useAfterWrite() {
  const qc = useQueryClient()
  return (booking?: Booking, opts: { serviceTypes?: boolean } = {}) => {
    if (booking) qc.setQueryData(bookingKeys.detail(booking.id), booking)
    qc.invalidateQueries({ queryKey: bookingKeys.lists() })
    qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
    if (opts.serviceTypes) qc.invalidateQueries({ queryKey: bookingKeys.serviceTypes() })
  }
}

export function useCreateBooking() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (input: BookingInput) => createBooking(input),
    onSuccess: (b) => after(b, { serviceTypes: true }),
  })
}

export function useUpdateBooking() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (vars: { id: string; input: Partial<BookingInput> }) => updateBooking(vars.id, vars.input),
    onSuccess: (b) => after(b, { serviceTypes: true }),
  })
}

export function useChangeBookingStatus() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (vars: { id: string; status: BookingStatus }) => changeBookingStatus(vars.id, vars.status),
    onSuccess: (b) => after(b),
  })
}

export function useRetryCalendarSync() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (id: string) => retryCalendarSync(id),
    onSuccess: (b) => after(b),
  })
}

export function useDeleteBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: bookingKeys.detail(id) })
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      qc.invalidateQueries({ queryKey: bookingKeys.serviceTypes() })
    },
  })
}
