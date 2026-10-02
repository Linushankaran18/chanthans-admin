import { z } from 'zod'
import { parseAmount } from '../../utils/format'
import { computeInvoiceTotals } from '../../utils/invoiceMath'

const MAX_AMOUNT = 9_999_999_999

function amountField(label: string, { required = true }: { required?: boolean } = {}) {
  return z.string().superRefine((v, ctx) => {
    if (!v.trim()) {
      if (required) ctx.addIssue({ code: 'custom', message: `${label} is required.` })
      return
    }
    const n = parseAmount(v)
    if (n === null) ctx.addIssue({ code: 'custom', message: 'Enter a valid amount, like 450 or 450.00.' })
    else if (n < 0) ctx.addIssue({ code: 'custom', message: 'Amount cannot be negative.' })
    else if (n > MAX_AMOUNT) ctx.addIssue({ code: 'custom', message: 'That amount is too large.' })
    else if (Math.round(n * 100) / 100 !== n) ctx.addIssue({ code: 'custom', message: 'Use at most two decimal places.' })
  })
}

const quantityField = z.string().superRefine((v, ctx) => {
  const n = parseAmount(v)
  if (n === null) ctx.addIssue({ code: 'custom', message: 'Enter a quantity.' })
  else if (n <= 0) ctx.addIssue({ code: 'custom', message: 'Quantity must be greater than zero.' })
  else if (Math.round(n * 100) / 100 !== n) ctx.addIssue({ code: 'custom', message: 'Use at most two decimal places.' })
})

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Description is required.').max(500, 'Description is too long.'),
  quantity: quantityField,
  unit_price: amountField('Unit price'),
})

export const invoiceSchema = z
  .object({
    customer_name: z.string().trim().min(1, 'Customer name is required.').max(255, 'Customer name is too long.'),
    customer_email: z.string().trim().max(254, 'Email is too long.').refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address.'),
    customer_phone: z.string().trim().max(50, 'Phone number is too long.'),
    billing_address: z.string().max(1000, 'Billing address is too long.'),
    issue_date: z.string().min(1, 'Issue date is required.'),
    due_date: z.string().min(1, 'Due date is required.'),
    currency: z.string().trim().regex(/^[A-Za-z]{3}$/, 'Use a 3-letter currency code, like CAD.'),
    items: z.array(invoiceItemSchema).min(1, 'Add at least one line item.').max(100, 'Too many line items.'),
    discount_amount: amountField('Discount', { required: false }),
    tax_name: z.string().trim().max(50, 'Tax name is too long.'),
    tax_rate: z.string().superRefine((v, ctx) => {
      if (!v.trim()) return
      const n = parseAmount(v)
      if (n === null) ctx.addIssue({ code: 'custom', message: 'Enter a rate like 13 or 5.' })
      else if (n < 0 || n > 100) ctx.addIssue({ code: 'custom', message: 'Tax rate must be between 0 and 100.' })
    }),
    amount_paid: amountField('Amount paid', { required: false }),
    notes: z.string().max(5000, 'Notes are too long.'),
    terms: z.string().max(5000, 'Terms are too long.'),
  })
  .superRefine((v, ctx) => {
    if (v.issue_date && v.due_date && v.due_date < v.issue_date) {
      ctx.addIssue({ code: 'custom', path: ['due_date'], message: "Due date can't be before the issue date." })
    }
    // Cross-field money rules only make sense once every line parses.
    const lines = v.items.map((i) => ({ quantity: parseAmount(i.quantity), unitPrice: parseAmount(i.unit_price) }))
    if (lines.some((l) => l.quantity === null || l.unitPrice === null || l.quantity <= 0 || l.unitPrice < 0)) return
    const totals = computeInvoiceTotals({
      items: lines.map((l) => ({ quantity: l.quantity as number, unitPrice: l.unitPrice as number })),
      discount: parseAmount(v.discount_amount) ?? 0,
      taxRate: parseAmount(v.tax_rate),
      amountPaid: parseAmount(v.amount_paid) ?? 0,
    })
    if (totals.discountTooHigh) {
      ctx.addIssue({ code: 'custom', path: ['discount_amount'], message: 'Discount cannot be more than the subtotal.' })
    }
    if (totals.overpaid) {
      ctx.addIssue({ code: 'custom', path: ['amount_paid'], message: 'Amount paid cannot be more than the invoice total.' })
    }
  })

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>

export const EMPTY_INVOICE_ITEM: InvoiceItemFormValues = { description: '', quantity: '1', unit_price: '' }
