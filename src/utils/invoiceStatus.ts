import { Ban, CheckCircle2, CircleDollarSign, Pencil, Send, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { InvoiceStatus, InvoiceSummary } from '../types/invoice'

export interface InvoiceStatusMeta {
  label: string
  icon: LucideIcon
  /** Pill classes: soft background + AA-contrast text + border (same hues as the PDF). */
  pill: string
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, InvoiceStatusMeta> = {
  DRAFT: { label: 'Draft', icon: Pencil, pill: 'bg-[#eef0f4] text-[#3b4252] border-[#d9dde6]' },
  ISSUED: { label: 'Issued', icon: Send, pill: 'bg-[#e6f1fb] text-[#17508f] border-[#bcd8f3]' },
  PARTIALLY_PAID: { label: 'Partially paid', icon: CircleDollarSign, pill: 'bg-[#fdf3dc] text-[#7a4b00] border-[#f2dca6]' },
  PAID: { label: 'Paid', icon: CheckCircle2, pill: 'bg-success-soft text-success border-[#bfe3cf]' },
  OVERDUE: { label: 'Overdue', icon: TriangleAlert, pill: 'bg-danger-soft text-danger border-[#f0c9cf]' },
  CANCELLED: { label: 'Cancelled', icon: Ban, pill: 'bg-[#f1f0f3] text-[#55525e] border-[#d6d3dc] line-through' },
}

// Used by the list filter chips (Overdue is a derived state, but the API filters on it).
export const FILTERABLE_STATUSES: InvoiceStatus[] = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']


/** What to show: OVERDUE when past due, otherwise the stored status. */
export function displayStatus(invoice: Pick<InvoiceSummary, 'status' | 'display_status'>): InvoiceStatus {
  return invoice.display_status ?? invoice.status
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_META[status]?.label ?? status
}

/** Which actions the status allows. Mirrors the API's rules; the API still enforces them. */
export function invoiceCapabilities(status: InvoiceStatus) {
  const open = status === 'ISSUED' || status === 'PARTIALLY_PAID' || status === 'OVERDUE'
  return {
    canEdit: status !== 'CANCELLED',
    canIssue: status === 'DRAFT',
    canRecordPayment: open || status === 'PAID',
    canMarkPaid: open,
    canCancel: status === 'DRAFT' || open,
    canDelete: status === 'DRAFT' || status === 'CANCELLED',
  }
}

export type InvoiceDeleteMode = 'delete' | 'cancel_then_delete' | 'blocked'

/**
 * How an invoice can be removed. Drafts and cancelled invoices go straight away; an issued invoice
 * with no payments is cancelled first. Anything with money recorded is a financial record and stays.
 */
export function invoiceDeleteMode(invoice: Pick<InvoiceSummary, 'status' | 'amount_paid'>): InvoiceDeleteMode {
  if (invoice.status === 'DRAFT' || invoice.status === 'CANCELLED') return 'delete'
  if (invoice.status === 'ISSUED' && invoice.amount_paid <= 0) return 'cancel_then_delete'
  return 'blocked'
}
