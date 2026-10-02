import { apiClient } from './client'
import type {
  Invoice,
  InvoiceDraft,
  InvoiceInput,
  InvoiceListParams,
  InvoicePageResponse,
  InvoiceSettings,
  InvoiceSummary,
  PdfDisposition,
} from '../types/invoice'

const BASE = '/admin/invoices'

export async function listInvoices(params: InvoiceListParams): Promise<InvoicePageResponse> {
  const query: Record<string, string | number> = {}
  if (params.status?.length) query.status = params.status.join(',')
  if (params.search) query.search = params.search
  if (params.date_from) query.date_from = params.date_from
  if (params.date_to) query.date_to = params.date_to
  query.page = params.page ?? 1
  query.page_size = params.page_size ?? 20
  const { data } = await apiClient.get<InvoicePageResponse>(BASE, { params: query })
  return data
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<Invoice>(`${BASE}/${id}`)
  return data
}

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const { data } = await apiClient.get<InvoiceSettings>(`${BASE}/settings`)
  return data
}

export async function getInvoiceDraft(bookingId: string): Promise<InvoiceDraft> {
  const { data } = await apiClient.get<InvoiceDraft>(`${BASE}/prefill`, { params: { booking_id: bookingId } })
  return data
}

/** The invoice linked to a booking, or null when it has none. */
export async function getInvoiceForBooking(bookingId: string): Promise<InvoiceSummary | null> {
  const { data } = await apiClient.get<InvoiceSummary | null>(`${BASE}/by-booking/${bookingId}`)
  return data ?? null
}

export async function createInvoice(input: InvoiceInput & { booking_id: string; status: 'DRAFT' | 'ISSUED' }): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(BASE, input)
  return data
}

export async function updateInvoice(id: string, input: Partial<InvoiceInput>): Promise<Invoice> {
  const { data } = await apiClient.put<Invoice>(`${BASE}/${id}`, input)
  return data
}

export async function changeInvoiceStatus(id: string, status: 'ISSUED' | 'CANCELLED'): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`${BASE}/${id}/status`, { status })
  return data
}

export async function recordInvoicePayment(
  id: string,
  payment: { amount_paid: number } | { mark_as_paid: true },
): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`${BASE}/${id}/payment`, payment)
  return data
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`)
}

export interface InvoicePdf {
  blob: Blob
  filename: string
}

/** Pulls `filename="..."` from a Content-Disposition header, if the browser exposes it. */
export function filenameFromDisposition(header: string | undefined | null): string | null {
  if (!header) return null
  const match = /filename="?([^";]+)"?/i.exec(header)
  return match ? match[1] : null
}

/**
 * Fetches the PDF with the auth header (a plain link can't send it). Falls back to
 * `<fallbackName>.pdf` when the browser hides Content-Disposition (cross-origin without expose-headers).
 */
export async function fetchInvoicePdf(id: string, disposition: PdfDisposition, fallbackName: string): Promise<InvoicePdf> {
  const res = await apiClient.get<Blob>(`${BASE}/${id}/pdf`, { params: { disposition }, responseType: 'blob' })
  const filename = filenameFromDisposition(res.headers?.['content-disposition'] as string | undefined) ?? `${fallbackName}.pdf`
  return { blob: res.data, filename }
}
