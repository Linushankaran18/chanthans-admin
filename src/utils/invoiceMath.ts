// Live totals for the invoice form. Display only: the API recalculates and validates everything.
// Integer arithmetic with half-up rounding, mirroring the backend's Decimal rules.

export interface LineInput {
  quantity: number
  unitPrice: number
}

export interface InvoiceTotals {
  /** Dollars (two decimals) */
  lineTotals: number[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paid: number
  balance: number
  discountTooHigh: boolean
  overpaid: boolean
}

/** a / b rounded half-up, for non-negative integers. */
function roundDiv(a: number, b: number): number {
  return Math.floor((2 * a + b) / (2 * b))
}

const cents = (dollars: number) => Math.round((Number.isFinite(dollars) ? dollars : 0) * 100)
const num = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

/** quantity (2 dp) × unit price (cents) → line total in cents. */
function lineCents(quantity: number, unitPrice: number): number {
  return roundDiv(Math.round(num(quantity) * 100) * cents(num(unitPrice)), 100)
}

export function lineTotal(quantity: number, unitPrice: number): number {
  return lineCents(quantity, unitPrice) / 100
}

/** `taxRate` is a percentage (13 = 13%), up to 4 decimals. */
export function computeInvoiceTotals(input: {
  items: LineInput[]
  discount: number
  taxRate: number | null
  amountPaid: number
}): InvoiceTotals {
  const lines = input.items.map((i) => lineCents(i.quantity, i.unitPrice))
  const subtotal = lines.reduce((a, b) => a + b, 0)
  const wantedDiscount = cents(num(input.discount))
  const discountTooHigh = wantedDiscount > subtotal
  const discount = Math.min(wantedDiscount, subtotal)
  const discounted = subtotal - discount
  const rate = Math.round(Math.min(num(input.taxRate ?? 0), 100) * 10_000)
  const tax = roundDiv(discounted * rate, 10_000 * 100)
  const total = discounted + tax
  const paid = cents(num(input.amountPaid))
  return {
    lineTotals: lines.map((c) => c / 100),
    subtotal: subtotal / 100,
    discount: discount / 100,
    tax: tax / 100,
    total: total / 100,
    paid: paid / 100,
    balance: (total - paid) / 100,
    discountTooHigh,
    overpaid: paid > total,
  }
}
