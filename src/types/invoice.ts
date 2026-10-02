export const INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export interface InvoiceSummary {
  id: string
  invoice_number: string
  booking_id: string
  booking_number: string
  customer_name: string
  /** YYYY-MM-DD */
  issue_date: string
  due_date: string
  /** ISO 4217, e.g. CAD */
  currency: string
  total_amount: number
  amount_paid: number
  balance_due: number
  /** The stored status. OVERDUE is never stored — see display_status. */
  status: InvoiceStatus
  /** OVERDUE when past due with a balance, otherwise the stored status. Use this for display. */
  display_status: InvoiceStatus | null
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
  display_order: number
}

export interface Invoice extends InvoiceSummary {
  customer_email: string | null
  customer_phone: string | null
  billing_address: string | null
  service_type: string
  event_date: string
  subtotal: number
  discount_amount: number
  tax_name: string | null
  /** A percentage: 13 means 13%. */
  tax_rate: number | null
  tax_amount: number
  notes: string | null
  terms: string | null
  items: InvoiceItem[]
}

export interface InvoiceItemInput {
  description: string
  quantity: number
  unit_price: number
}

export interface InvoiceDraftItem {
  description: string
  quantity: number
  unit_price: number
}

/** Pre-filled, unsaved invoice from GET /admin/invoices/prefill. */
export interface InvoiceDraft {
  booking_id: string
  booking_number: string
  service_type: string
  event_date: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  billing_address: string | null
  issue_date: string
  due_date: string
  currency: string
  items: InvoiceDraftItem[]
  discount_amount: number
  tax_name: string | null
  tax_rate: number | null
  amount_paid: number
  notes: string | null
  terms: string | null
  next_invoice_number: string
  existing_invoice_id: string | null
}

export interface InvoiceSettings {
  business_name: string
  business_logo_url: string
  business_address: string
  business_phone: string
  business_email: string
  business_website: string
  currency: string
  invoice_due_days: number
  tax_name: string | null
  tax_rate: number | null
  default_notes: string | null
  default_terms: string
}

/** Body for POST (plus booking_id/status) and PUT. Totals are always computed by the server. */
export interface InvoiceInput {
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  billing_address: string | null
  issue_date: string
  due_date: string
  currency: string
  items: InvoiceItemInput[]
  discount_amount: number
  tax_name: string | null
  tax_rate: number | null
  amount_paid: number
  notes: string | null
  terms: string | null
}

export interface InvoiceListParams {
  /** OVERDUE is accepted here; the API treats it as the derived "past due" filter. */
  status?: InvoiceStatus[]
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}

export interface InvoicePageResponse {
  items: InvoiceSummary[]
  total: number
  page: number
  page_size: number
  pages: number
}

export type PdfDisposition = 'attachment' | 'inline'
