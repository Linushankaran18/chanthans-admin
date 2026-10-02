import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { INVOICE_STATUSES, type InvoiceListParams, type InvoiceStatus } from '../types/invoice'

export const INVOICE_PAGE_SIZE = 20

export interface InvoiceFilterState {
  search: string
  status: InvoiceStatus[]
  date_from: string
  date_to: string
}

export const DEFAULT_INVOICE_FILTERS: InvoiceFilterState = { search: '', status: [], date_from: '', date_to: '' }

/** Invoice list filters + page, kept in the URL query string. */
export function useInvoiceFilters() {
  const [sp, setSp] = useSearchParams()

  const filters = useMemo<InvoiceFilterState>(() => {
    const statuses = (sp.get('status') ?? '')
      .split(',')
      .filter((s): s is InvoiceStatus => (INVOICE_STATUSES as readonly string[]).includes(s))
    return { search: sp.get('search') ?? '', status: statuses, date_from: sp.get('date_from') ?? '', date_to: sp.get('date_to') ?? '' }
  }, [sp])

  const page = Math.max(1, Number.parseInt(sp.get('page') ?? '1', 10) || 1)

  const params = useMemo<InvoiceListParams>(
    () => ({
      search: filters.search.trim() || undefined,
      status: filters.status.length ? filters.status : undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      page,
      page_size: INVOICE_PAGE_SIZE,
    }),
    [filters, page],
  )

  const write = useCallback(
    (next: InvoiceFilterState, nextPage: number) => {
      const q = new URLSearchParams()
      if (next.search.trim()) q.set('search', next.search.trim())
      if (next.status.length) q.set('status', next.status.join(','))
      if (next.date_from) q.set('date_from', next.date_from)
      if (next.date_to) q.set('date_to', next.date_to)
      if (nextPage > 1) q.set('page', String(nextPage))
      setSp(q, { replace: true })
    },
    [setSp],
  )

  const setFilters = useCallback((patch: Partial<InvoiceFilterState>) => write({ ...filters, ...patch }, 1), [filters, write])
  const setPage = useCallback((p: number) => write(filters, p), [filters, write])
  const clear = useCallback(() => write(DEFAULT_INVOICE_FILTERS, 1), [write])

  const activeCount =
    (filters.search.trim() ? 1 : 0) + (filters.status.length ? 1 : 0) + (filters.date_from || filters.date_to ? 1 : 0)

  return { filters, params, page, setFilters, setPage, clear, activeCount }
}
