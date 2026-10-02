import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BOOKING_STATUSES, type BookingListParams, type BookingSort, type BookingStatus } from '../types/booking'

export const PAGE_SIZE = 20

export interface BookingFilters {
  search: string
  status: BookingStatus[]
  service_type: string
  date_from: string
  date_to: string
  sort: BookingSort
}

export const DEFAULT_FILTERS: BookingFilters = { search: '', status: [], service_type: '', date_from: '', date_to: '', sort: 'date_desc' }

const SORTS: BookingSort[] = ['date_desc', 'date_asc', 'created_desc']

/** Booking list filters + page, kept in the URL query string. */
export function useBookingFilters() {
  const [sp, setSp] = useSearchParams()

  const filters = useMemo<BookingFilters>(() => {
    const statuses = (sp.get('status') ?? '')
      .split(',')
      .filter((s): s is BookingStatus => (BOOKING_STATUSES as readonly string[]).includes(s))
    const sort = sp.get('sort') as BookingSort | null
    return {
      search: sp.get('search') ?? '',
      status: statuses,
      service_type: sp.get('service_type') ?? '',
      date_from: sp.get('date_from') ?? '',
      date_to: sp.get('date_to') ?? '',
      sort: sort && SORTS.includes(sort) ? sort : 'date_desc',
    }
  }, [sp])

  const page = Math.max(1, Number.parseInt(sp.get('page') ?? '1', 10) || 1)

  const params = useMemo<BookingListParams>(
    () => ({
      search: filters.search.trim() || undefined,
      status: filters.status.length ? filters.status : undefined,
      service_type: filters.service_type || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      sort: filters.sort,
      page,
      page_size: PAGE_SIZE,
    }),
    [filters, page],
  )

  const write = useCallback(
    (next: BookingFilters, nextPage: number) => {
      const q = new URLSearchParams()
      if (next.search.trim()) q.set('search', next.search.trim())
      if (next.status.length) q.set('status', next.status.join(','))
      if (next.service_type) q.set('service_type', next.service_type)
      if (next.date_from) q.set('date_from', next.date_from)
      if (next.date_to) q.set('date_to', next.date_to)
      if (next.sort !== 'date_desc') q.set('sort', next.sort)
      if (nextPage > 1) q.set('page', String(nextPage))
      setSp(q, { replace: true })
    },
    [setSp],
  )

  const setFilters = useCallback((patch: Partial<BookingFilters>) => write({ ...filters, ...patch }, 1), [filters, write])
  const setPage = useCallback((p: number) => write(filters, p), [filters, write])
  const clear = useCallback(() => write({ ...DEFAULT_FILTERS, sort: filters.sort }, 1), [filters.sort, write])

  const activeCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.status.length ? 1 : 0) +
    (filters.service_type ? 1 : 0) +
    (filters.date_from || filters.date_to ? 1 : 0)

  return { filters, params, page, setFilters, setPage, clear, activeCount }
}
