import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp, makeInvoice, toSummary } from '../test/render'
import type { InvoicePageResponse } from '../types/invoice'

vi.mock('../api/invoices', () => ({ listInvoices: vi.fn() }))
import { listInvoices } from '../api/invoices'
import InvoicesPage from './InvoicesPage'

const mockList = vi.mocked(listInvoices)
const page = (items: InvoicePageResponse['items']): InvoicePageResponse => ({ items, total: items.length, page: 1, page_size: 20, pages: 1 })

// (mocks are restored by vitest config: restoreMocks)

describe('InvoicesPage', () => {
  it('shows a skeleton while loading, then the invoices', async () => {
    mockList.mockResolvedValue(page([
      toSummary(makeInvoice()),
      toSummary(makeInvoice({ id: 'inv-2', invoice_number: 'INV-2026-0002', customer_name: 'Marcus Lee', status: 'ISSUED', display_status: 'OVERDUE', is_overdue: true, balance_due: 900, total_amount: 900 })),
    ]))
    renderApp(<InvoicesPage />)
    expect(screen.getByRole('status', { name: 'Loading invoices' })).toBeInTheDocument()

    const table = await screen.findByRole('table', { name: 'Invoices' })
    expect(within(table).getByText('INV-2026-0001')).toBeInTheDocument()
    expect(within(table).getByText('Priya Nair')).toBeInTheDocument()
    expect(within(table).getByText('$3,107.50')).toBeInTheDocument()
    expect(within(table).getByText('Partially paid')).toBeInTheDocument()
    expect(within(table).getByText('Overdue')).toBeInTheDocument() // display_status, not stored status
    expect(screen.getByText('2 invoices')).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Loading invoices' })).not.toBeInTheDocument()
  })

  it('shows the empty state with a link to bookings', async () => {
    mockList.mockResolvedValue(page([]))
    renderApp(<InvoicesPage />)
    expect(await screen.findByText('No invoices yet')).toBeInTheDocument()
    expect(screen.getByText('Create an invoice from a booking to start tracking studio payments.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Bookings' })).toHaveAttribute('href', '/dashboard/bookings')
  })

  it('shows a different empty state when filters match nothing', async () => {
    mockList.mockResolvedValue(page([]))
    renderApp(<InvoicesPage />, { route: '/?search=zzz' })
    expect(await screen.findByText('No invoices match your filters')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Clear filters' }).length).toBeGreaterThan(0)
  })

  it('passes URL filters to the API', async () => {
    mockList.mockResolvedValue(page([]))
    renderApp(<InvoicesPage />, { route: '/?search=priya&status=OVERDUE,PAID&date_from=2026-10-01' })
    await screen.findByText('No invoices match your filters')
    expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ search: 'priya', status: ['OVERDUE', 'PAID'], date_from: '2026-10-01', page: 1 }))
  })

  it('shows a friendly error with retry', async () => {
    mockList.mockRejectedValue({ response: { status: 500 } })
    renderApp(<InvoicesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your invoices right now.")
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
