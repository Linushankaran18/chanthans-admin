import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeInvoiceStatus,
  createInvoice,
  deleteInvoice,
  getInvoice,
  getInvoiceDraft,
  getInvoiceForBooking,
  getInvoiceSettings,
  listInvoices,
  recordInvoicePayment,
  updateInvoice,
} from '../api/invoices'
import type { Invoice, InvoiceInput, InvoiceListParams } from '../types/invoice'
import { DASHBOARD_KEY } from './useDashboard'

export const INVOICES_KEY = ['invoices'] as const
export const invoiceKeys = {
  lists: () => [...INVOICES_KEY, 'list'] as const,
  list: (params: InvoiceListParams) => [...INVOICES_KEY, 'list', params] as const,
  detail: (id: string) => [...INVOICES_KEY, 'detail', id] as const,
  forBooking: (bookingId: string) => [...INVOICES_KEY, 'booking', bookingId] as const,
  draft: (bookingId: string) => [...INVOICES_KEY, 'draft', bookingId] as const,
  settings: () => [...INVOICES_KEY, 'settings'] as const,
}

export function useInvoiceList(params: InvoiceListParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => listInvoices(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.detail(id ?? ''),
    queryFn: () => getInvoice(id as string),
    enabled: !!id,
    retry: (count, error) => {
      const s = (error as { response?: { status?: number } })?.response?.status
      return s !== 404 && count < 1
    },
  })
}

export function useInvoiceSettings() {
  return useQuery({ queryKey: invoiceKeys.settings(), queryFn: getInvoiceSettings, staleTime: 10 * 60_000 })
}

/** Pre-filled draft for a booking. Always fresh: it carries today's dates and the next invoice number. */
export function useInvoiceDraft(bookingId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.draft(bookingId ?? ''),
    queryFn: () => getInvoiceDraft(bookingId as string),
    enabled: !!bookingId,
    staleTime: 0,
    gcTime: 0,
    retry: (count, error) => {
      const s = (error as { response?: { status?: number } })?.response?.status
      return s !== 404 && count < 1
    },
  })
}

export function useInvoiceForBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.forBooking(bookingId ?? ''),
    queryFn: () => getInvoiceForBooking(bookingId as string),
    enabled: !!bookingId,
    staleTime: 15_000,
  })
}

/** After any write: refresh lists, the booking's invoice card and the dashboard. */
function useAfterWrite() {
  const qc = useQueryClient()
  return (invoice?: Invoice) => {
    if (invoice) {
      qc.setQueryData(invoiceKeys.detail(invoice.id), invoice)
      qc.invalidateQueries({ queryKey: invoiceKeys.forBooking(invoice.booking_id) })
    } else {
      qc.invalidateQueries({ queryKey: [...INVOICES_KEY, 'booking'] })
    }
    qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
    qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
  }
}

export function useCreateInvoice() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (vars: { bookingId: string; input: InvoiceInput; status: 'DRAFT' | 'ISSUED' }) =>
      createInvoice({ ...vars.input, booking_id: vars.bookingId, status: vars.status }),
    onSuccess: (inv) => after(inv),
  })
}

export function useUpdateInvoice() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (vars: { id: string; input: Partial<InvoiceInput> }) => updateInvoice(vars.id, vars.input),
    onSuccess: (inv) => after(inv),
  })
}

export function useChangeInvoiceStatus() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (vars: { id: string; status: 'ISSUED' | 'CANCELLED' }) => changeInvoiceStatus(vars.id, vars.status),
    onSuccess: (inv) => after(inv),
  })
}

export function useRecordPayment() {
  const after = useAfterWrite()
  return useMutation({
    mutationFn: (vars: { id: string; payment: { amount_paid: number } | { mark_as_paid: true } }) =>
      recordInvoicePayment(vars.id, vars.payment),
    onSuccess: (inv) => after(inv),
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; bookingId: string }) => deleteInvoice(vars.id),
    onSuccess: (_d, vars) => {
      qc.removeQueries({ queryKey: invoiceKeys.detail(vars.id) })
      qc.invalidateQueries({ queryKey: invoiceKeys.forBooking(vars.bookingId) })
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
    },
  })
}
