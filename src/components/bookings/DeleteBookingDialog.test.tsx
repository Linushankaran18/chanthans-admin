import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, makeInvoice, toSummary } from '../../test/render'

vi.mock('../../api/bookings', async (orig) => ({ ...(await orig<typeof import('../../api/bookings')>()), deleteBooking: vi.fn() }))
vi.mock('../../api/invoices', async (orig) => ({ ...(await orig<typeof import('../../api/invoices')>()), getInvoiceForBooking: vi.fn() }))
import { deleteBooking } from '../../api/bookings'
import { getInvoiceForBooking } from '../../api/invoices'
import { DeleteBookingDialog } from './DeleteBookingDialog'

const booking = { id: 'bk-1', booking_number: 'BK-2026-0012' }
const invoice = (over = {}) => toSummary(makeInvoice({ booking_id: 'bk-1', ...over }))

beforeEach(() => {
  vi.mocked(deleteBooking).mockReset().mockResolvedValue(undefined)
  vi.mocked(getInvoiceForBooking).mockReset()
})

describe('DeleteBookingDialog', () => {
  it('no invoice: plain delete', async () => {
    vi.mocked(getInvoiceForBooking).mockResolvedValue(null)
    renderApp(<DeleteBookingDialog booking={booking} onClose={() => {}} />)
    const user = userEvent.setup()
    const dialog = await screen.findByRole('alertdialog')
    await user.click(await within(dialog).findByRole('button', { name: 'Delete Booking' }))
    await waitFor(() => expect(deleteBooking).toHaveBeenCalledWith('bk-1', false))
  })

  it('draft invoice: says it will be deleted too and asks the API to do so', async () => {
    vi.mocked(getInvoiceForBooking).mockResolvedValue(invoice({ status: 'DRAFT', display_status: 'DRAFT', amount_paid: 0 }))
    renderApp(<DeleteBookingDialog booking={booking} onClose={() => {}} />)
    const user = userEvent.setup()
    const dialog = await screen.findByRole('alertdialog')
    const both = await within(dialog).findByRole('button', { name: 'Delete Both' })
    expect(dialog).toHaveTextContent('INV-2026-0001')
    await user.click(both)
    await waitFor(() => expect(deleteBooking).toHaveBeenCalledWith('bk-1', true))
  })

  it('issued invoice: blocks and points to the invoice', async () => {
    vi.mocked(getInvoiceForBooking).mockResolvedValue(invoice({ status: 'ISSUED', display_status: 'ISSUED', amount_paid: 0 }))
    renderApp(<DeleteBookingDialog booking={booking} onClose={() => {}} />)
    expect(await screen.findByRole('link', { name: 'Go to invoice' })).toHaveAttribute('href', '/dashboard/invoices/inv-1')
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    expect(deleteBooking).not.toHaveBeenCalled()
  })
})
