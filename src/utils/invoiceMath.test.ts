import { describe, expect, it } from 'vitest'
import { computeInvoiceTotals, lineTotal } from './invoiceMath'

describe('invoiceMath', () => {
  it('matches the backend worked example', () => {
    const t = computeInvoiceTotals({
      items: [
        { quantity: 1, unitPrice: 2200 },
        { quantity: 1, unitPrice: 450 },
        { quantity: 1, unitPrice: 100 },
        { quantity: 2, unitPrice: 50 },
      ],
      discount: 100,
      taxRate: 13,
      amountPaid: 500,
    })
    expect(t.lineTotals).toEqual([2200, 450, 100, 100])
    expect(t.subtotal).toBe(2850)
    expect(t.tax).toBe(357.5)
    expect(t.total).toBe(3107.5)
    expect(t.paid).toBe(500)
    expect(t.balance).toBe(2607.5)
    expect(t.discountTooHigh).toBe(false)
    expect(t.overpaid).toBe(false)
  })

  it('rounds half-up to the cent like the backend', () => {
    expect(lineTotal(1.5, 33.33)).toBe(50) // 49.995
    expect(lineTotal(3, 0.1)).toBe(0.3) // no float drift (0.30000000000000004)
    expect(lineTotal(0.5, 0.05)).toBe(0.03) // 0.025 rounds up
  })

  it('applies tax after the discount, with half-up rounding', () => {
    const t = computeInvoiceTotals({ items: [{ quantity: 1, unitPrice: 1000 }], discount: 200, taxRate: 10, amountPaid: 0 })
    expect(t.tax).toBe(80)
    expect(t.total).toBe(880)
    const r = computeInvoiceTotals({ items: [{ quantity: 1, unitPrice: 0.5 }], discount: 0, taxRate: 5, amountPaid: 0 }) // 0.025 -> 0.03
    expect(r.tax).toBe(0.03)
  })

  it('treats a missing tax rate as no tax', () => {
    const t = computeInvoiceTotals({ items: [{ quantity: 1, unitPrice: 100 }], discount: 0, taxRate: null, amountPaid: 0 })
    expect(t.tax).toBe(0)
    expect(t.total).toBe(100)
  })

  it('flags a discount larger than the subtotal and clamps it', () => {
    const t = computeInvoiceTotals({ items: [{ quantity: 1, unitPrice: 100 }], discount: 150, taxRate: 13, amountPaid: 0 })
    expect(t.discountTooHigh).toBe(true)
    expect(t.discount).toBe(100)
    expect(t.total).toBe(0)
  })

  it('flags an overpayment', () => {
    const t = computeInvoiceTotals({ items: [{ quantity: 1, unitPrice: 100 }], discount: 0, taxRate: null, amountPaid: 100.01 })
    expect(t.overpaid).toBe(true)
  })

  it('ignores junk input instead of producing NaN', () => {
    const t = computeInvoiceTotals({ items: [{ quantity: Number.NaN, unitPrice: 10 }, { quantity: 1, unitPrice: -5 }], discount: Number.NaN, taxRate: Number.NaN, amountPaid: Number.NaN })
    expect(t.total).toBe(0)
    expect(Number.isNaN(t.balance)).toBe(false)
  })
})
