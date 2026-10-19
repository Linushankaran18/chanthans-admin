import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../../test/render'
import type { Booking } from '../../types/booking'

vi.mock('../../api/bookings', async (orig) => ({
  ...(await orig<typeof import('../../api/bookings')>()),
  getBookingShare: vi.fn(),
  enableBookingShare: vi.fn(),
  revokeBookingShare: vi.fn(),
}))
import { enableBookingShare, getBookingShare, revokeBookingShare } from '../../api/bookings'
import { ShareCard, whatsappShareUrl } from './ShareCard'

const booking = {
  id: 'bk-1', service_type: 'Wedding', customer_name: 'Priya Nair', customer_phone: '(416) 555-0134', customer_email: 'priya@example.com',
  event_date: '2026-11-15', start_time: '09:00:00', end_time: '17:00:00', location: 'Toronto', total_amount: 2500, is_shared: false,
} as unknown as Booking
const LINK = 'https://admin.test/share/tok123'

beforeEach(() => {
  vi.mocked(getBookingShare).mockReset()
  vi.mocked(enableBookingShare).mockReset()
  vi.mocked(revokeBookingShare).mockReset()
})

describe('whatsappShareUrl', () => {
  it('contains the event basics and link but no private data', () => {
    const url = whatsappShareUrl(booking, LINK)
    expect(url.startsWith('https://wa.me/?text=')).toBe(true)
    const text = decodeURIComponent(url.split('text=')[1])
    expect(text).toContain('Wedding — Priya Nair')
    expect(text).toContain('Toronto')
    expect(text).toContain(LINK)
    expect(text).not.toMatch(/555|priya@example|2500/)
  })
})

describe('ShareCard', () => {
  it('not shared yet: explains what is hidden and creates a link on click', async () => {
    vi.mocked(enableBookingShare).mockResolvedValue({ url: LINK })
    renderApp(<ShareCard booking={booking} />)
    const user = userEvent.setup()
    expect(screen.getByText(/never shown/i)).toBeInTheDocument()
    expect(getBookingShare).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /create share link/i }))
    await waitFor(() => expect(enableBookingShare).toHaveBeenCalledWith('bk-1'))
  })

  it('shared: shows the link, a WhatsApp share and can turn it off', async () => {
    vi.mocked(getBookingShare).mockResolvedValue({ url: LINK })
    vi.mocked(revokeBookingShare).mockResolvedValue(undefined)
    renderApp(<ShareCard booking={{ ...booking, is_shared: true }} />)
    const user = userEvent.setup()
    expect(await screen.findByDisplayValue(LINK)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /share on whatsapp/i })).toHaveAttribute('href', expect.stringContaining('https://wa.me/?text='))
    expect(screen.getByRole('link', { name: /share on whatsapp/i })).toHaveAttribute('rel', expect.stringContaining('noopener'))
    await user.click(screen.getByRole('button', { name: /turn off/i }))
    await waitFor(() => expect(revokeBookingShare).toHaveBeenCalledWith('bk-1'))
  })
})
