import type { Invoice, InvoiceDraft, InvoiceInput, InvoiceStatus } from '../../types/invoice'
import { parseAmount } from '../../utils/format'
import { computeInvoiceTotals, type InvoiceTotals } from '../../utils/invoiceMath'
import type { InvoiceDocumentData } from './InvoiceDocument'
import { EMPTY_INVOICE_ITEM, type InvoiceFormValues } from './invoiceSchema'

const str = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n))

export function draftToForm(d: InvoiceDraft): InvoiceFormValues {
  return {
    customer_name: d.customer_name,
    customer_email: d.customer_email ?? '',
    customer_phone: d.customer_phone ?? '',
    billing_address: d.billing_address ?? '',
    issue_date: d.issue_date,
    due_date: d.due_date,
    currency: d.currency,
    items: d.items.length
      ? d.items.map((i) => ({ description: i.description, quantity: str(i.quantity), unit_price: str(i.unit_price) }))
      : [{ ...EMPTY_INVOICE_ITEM }],
    discount_amount: d.discount_amount ? str(d.discount_amount) : '',
    tax_name: d.tax_name ?? '',
    tax_rate: str(d.tax_rate),
    amount_paid: d.amount_paid ? str(d.amount_paid) : '',
    notes: d.notes ?? '',
    terms: d.terms ?? '',
  }
}

export function invoiceToForm(inv: Invoice): InvoiceFormValues {
  return {
    customer_name: inv.customer_name,
    customer_email: inv.customer_email ?? '',
    customer_phone: inv.customer_phone ?? '',
    billing_address: inv.billing_address ?? '',
    issue_date: inv.issue_date,
    due_date: inv.due_date,
    currency: inv.currency,
    items: inv.items.map((i) => ({ description: i.description, quantity: str(i.quantity), unit_price: str(i.unit_price) })),
    discount_amount: inv.discount_amount ? str(inv.discount_amount) : '',
    tax_name: inv.tax_name ?? '',
    tax_rate: str(inv.tax_rate),
    amount_paid: inv.amount_paid ? str(inv.amount_paid) : '',
    notes: inv.notes ?? '',
    terms: inv.terms ?? '',
  }
}

/** Form strings -> API payload. Empty optionals become null so they can be cleared. */
export function formToInput(v: InvoiceFormValues): InvoiceInput {
  return {
    customer_name: v.customer_name.trim(),
    customer_email: v.customer_email.trim() || null,
    customer_phone: v.customer_phone.trim() || null,
    billing_address: v.billing_address.trim() || null,
    issue_date: v.issue_date,
    due_date: v.due_date,
    currency: v.currency.trim().toUpperCase(),
    items: v.items.map((i) => ({
      description: i.description.trim(),
      quantity: parseAmount(i.quantity) ?? 0,
      unit_price: parseAmount(i.unit_price) ?? 0,
    })),
    discount_amount: parseAmount(v.discount_amount) ?? 0,
    tax_name: v.tax_name.trim() || null,
    tax_rate: parseAmount(v.tax_rate),
    amount_paid: parseAmount(v.amount_paid) ?? 0,
    notes: v.notes.trim() || null,
    terms: v.terms.trim() || null,
  }
}

// ---- Live preview ------------------------------------------------------------


/** Totals for whatever is currently typed (unparseable fields count as zero). */
export function totalsFromForm(v: Pick<InvoiceFormValues, 'items' | 'discount_amount' | 'tax_rate' | 'amount_paid'>): InvoiceTotals {
  return computeInvoiceTotals({
    items: (v.items ?? []).map((i) => ({ quantity: parseAmount(i?.quantity ?? '') ?? 0, unitPrice: parseAmount(i?.unit_price ?? '') ?? 0 })),
    discount: parseAmount(v.discount_amount ?? '') ?? 0,
    taxRate: parseAmount(v.tax_rate ?? ''),
    amountPaid: parseAmount(v.amount_paid ?? '') ?? 0,
  })
}

export function formToDocument(
  v: InvoiceFormValues,
  totals: InvoiceTotals,
  extra: { invoiceNumber: string | null; status: InvoiceStatus; bookingNumber: string; serviceType: string; eventDate: string },
): InvoiceDocumentData {
  const rate = parseAmount(v.tax_rate)
  return {
    invoiceNumber: extra.invoiceNumber,
    issueDate: v.issue_date,
    dueDate: v.due_date,
    status: extra.status,
    currency: v.currency.trim().toUpperCase() || 'CAD',
    customerName: v.customer_name.trim(),
    customerLines: [...v.billing_address.split('\n'), v.customer_email, v.customer_phone].map((l) => l.trim()).filter(Boolean),
    bookingNumber: extra.bookingNumber,
    serviceType: extra.serviceType,
    eventDate: extra.eventDate,
    items: v.items.map((i, idx) => ({
      description: i.description.trim(),
      quantity: parseAmount(i.quantity) ?? 0,
      unitPrice: parseAmount(i.unit_price) ?? 0,
      amount: totals.lineTotals[idx] ?? 0,
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    taxLabel: totals.tax > 0 || (rate ?? 0) > 0 ? `${v.tax_name.trim() || 'Tax'}${rate != null ? ` (${rate}%)` : ''}` : null,
    tax: totals.tax,
    total: totals.total,
    paid: totals.paid,
    balance: totals.balance,
    notes: v.notes.trim() || null,
    terms: v.terms.trim() || null,
  }
}
