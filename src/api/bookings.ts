import { apiClient } from './client'
import type {
  Booking,
  BookingInput,
  BookingListParams,
  BookingListResponse,
  BookingStatus,
} from '../types/booking'

export async function listBookings(params: BookingListParams): Promise<BookingListResponse> {
  const query: Record<string, string | number> = {}
  if (params.status?.length) query.status = params.status.join(',')
  if (params.search) query.search = params.search
  if (params.date_from) query.date_from = params.date_from
  if (params.date_to) query.date_to = params.date_to
  if (params.service_type) query.service_type = params.service_type
  if (params.sort) query.sort = params.sort
  query.page = params.page ?? 1
  query.page_size = params.page_size ?? 20
  const { data } = await apiClient.get<BookingListResponse>('/admin/bookings', { params: query })
  return data
}

export async function listServiceTypes(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/admin/bookings/service-types')
  return data
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.get<Booking>(`/admin/bookings/${id}`)
  return data
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const { data } = await apiClient.post<Booking>('/admin/bookings', input)
  return data
}

export async function updateBooking(id: string, input: Partial<BookingInput>): Promise<Booking> {
  const { data } = await apiClient.put<Booking>(`/admin/bookings/${id}`, input)
  return data
}

export async function changeBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  const { data } = await apiClient.patch<Booking>(`/admin/bookings/${id}/status`, { status })
  return data
}

export async function deleteBooking(id: string): Promise<void> {
  await apiClient.delete(`/admin/bookings/${id}`)
}

export async function retryCalendarSync(id: string): Promise<Booking> {
  const { data } = await apiClient.post<Booking>(`/admin/bookings/${id}/calendar-sync`)
  return data
}
