import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvoiceStatusBadge } from '../components/invoices/InvoiceStatusBadge'
import { INVOICE_STATUSES } from '../types/invoice'
import { displayStatus, invoiceCapabilities } from './invoiceStatus'

describe('invoice status display', () => {
  it.each(INVOICE_STATUSES)('%s shows a text label and an icon, not just colour', (status) => {
    const { container } = render(<InvoiceStatusBadge status={status} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.textContent?.trim().length).toBeGreaterThan(2)
  })

  it('uses readable labels', () => {
    render(<InvoiceStatusBadge status="PARTIALLY_PAID" />)
    expect(screen.getByText('Partially paid')).toBeInTheDocument()
  })

  it('prefers display_status so an overdue invoice reads Overdue', () => {
    expect(displayStatus({ status: 'ISSUED', display_status: 'OVERDUE' })).toBe('OVERDUE')
    expect(displayStatus({ status: 'ISSUED', display_status: null })).toBe('ISSUED')
    render(<InvoiceStatusBadge status={displayStatus({ status: 'ISSUED', display_status: 'OVERDUE' })} />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('allows only the actions each status permits', () => {
    expect(invoiceCapabilities('DRAFT')).toMatchObject({ canEdit: true, canIssue: true, canMarkPaid: false, canCancel: true, canDelete: true })
    expect(invoiceCapabilities('ISSUED')).toMatchObject({ canIssue: false, canMarkPaid: true, canCancel: true, canDelete: false })
    expect(invoiceCapabilities('OVERDUE')).toMatchObject({ canMarkPaid: true, canCancel: true })
    expect(invoiceCapabilities('PAID')).toMatchObject({ canMarkPaid: false, canCancel: false, canRecordPayment: true })
    expect(invoiceCapabilities('CANCELLED')).toMatchObject({ canEdit: false, canRecordPayment: false, canDelete: true })
  })
})
