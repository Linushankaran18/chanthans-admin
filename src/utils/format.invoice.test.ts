import { describe, expect, it } from 'vitest'
import { formatMoneyIn } from './format'

describe('formatMoneyIn', () => {
  it('renders CAD as $2,500.00 (same as the PDF)', () => {
    expect(formatMoneyIn(2500, 'CAD')).toBe('$2,500.00')
    expect(formatMoneyIn(0, 'CAD')).toBe('$0.00')
    expect(formatMoneyIn(3107.5, 'CAD')).toBe('$3,107.50')
  })
  it('prefixes other dollar currencies so they are not confused with CAD', () => {
    expect(formatMoneyIn(1234.5, 'USD')).toBe('US$1,234.50')
  })
  it('falls back safely for an invalid currency and for missing values', () => {
    expect(formatMoneyIn(10, 'nope')).toBe('$10.00')
    expect(formatMoneyIn(null, 'CAD')).toBe('—')
  })
})
