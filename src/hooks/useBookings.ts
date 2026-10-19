import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeBookingStatus,
  createBooking,
  deleteBooking,
  enableBookingShare,
  getBooking,
  getBookingShare,
  listBookings,
  listServiceTypes,
  retryCalendarSync,
  revokeBookingShare,
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
  share: (id: string) => [...BOOKINGS_KEY, 'share', id] as const,
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
    mutationFn: (vars: { id: string; status: BookingStatus; allowOverlap?: boolean }) =>
      changeBookingStatus(vars.id, vars.status, vars.allowOverlap),
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
    mutationFn: (vars: { id: string; deleteInvoice?: boolean }) => deleteBooking(vars.id, vars.deleteInvoice),
    onSuccess: (_d, vars) => {
      qc.removeQueries({ queryKey: bookingKeys.detail(vars.id) })
      qc.removeQueries({ queryKey: bookingKeys.share(vars.id) })
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
      // The booking's invoice may have gone with it.
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      qc.invalidateQueries({ queryKey: bookingKeys.serviceTypes() })
    },
  })
}

export function useBookingShare(id: string | undefined, enabled: boolean) {
  return useQuery({ queryKey: bookingKeys.share(id ?? ''), queryFn: () => getBookingShare(id as string), enabled: !!id && enabled })
}

export function useEnableShare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => enableBookingShare(id),
    onSuccess: (link, id) => {
      qc.setQueryData(bookingKeys.share(id), link)
      qc.setQueryData<Booking>(bookingKeys.detail(id), (b) => (b ? { ...b, is_shared: true } : b))
    },
  })
}

export function useRevokeShare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeBookingShare(id),
    onSuccess: (_d, id) => {
      qc.setQueryData(bookingKeys.share(id), null)
      qc.setQueryData<Booking>(bookingKeys.detail(id), (b) => (b ? { ...b, is_shared: false } : b))
    },
  })
}
