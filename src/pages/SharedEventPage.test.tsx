import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'
import type { SharedEvent } from '../types/share'

vi.mock('../api/sharedEvents', () => ({
  getSharedEvent: vi.fn(),
  sharedEventIcsUrl: (t: string) => `https://api.test/shared-events/${t}/calendar.ics`,
}))
import { getSharedEvent } from '../api/sharedEvents'
import SharedEventPage from './SharedEventPage'

const event: SharedEvent = {
  service_type: 'Wedding',
  customer_name: 'Priya Nair',
  event_date: '2026-11-15',
  start_time: '09:00:00',
  end_time: '17:00:00',
  location: 'Toronto',
  status: 'CONFIRMED',
  timezone: 'America/Toronto',
}
const load = () => renderApp(<SharedEventPage />, { route: '/share/tok123', path: '/share/:token' })

beforeEach(() => { vi.mocked(getSharedEvent).mockReset() })

describe('SharedEventPage', () => {
  it('shows the event and calendar actions, nothing sensitive', async () => {
    vi.mocked(getSharedEvent).mockResolvedValue(event)
    const { container } = load()
    expect(await screen.findByRole('heading', { name: 'Wedding' })).toBeInTheDocument()
    expect(getSharedEvent).toHaveBeenCalledWith('tok123')
    expect(screen.getByText('Priya Nair')).toBeInTheDocument()
    expect(screen.getByText('Toronto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add to google calendar/i })).toHaveAttribute('href', expect.stringContaining('calendar.google.com'))
    expect(screen.getByRole('link', { name: /apple \/ outlook/i })).toHaveAttribute('href', 'https://api.test/shared-events/tok123/calendar.ics')
    expect(container.textContent).not.toMatch(/\$|@|\(\d{3}\)/)
  })

  it('cancelled events say so and offer no calendar buttons', async () => {
    vi.mocked(getSharedEvent).mockResolvedValue({ ...event, status: 'CANCELLED' })
    load()
    expect(await screen.findByText('This event has been cancelled')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /google calendar/i })).not.toBeInTheDocument()
  })

  it('expired or revoked links show a friendly message', async () => {
    vi.mocked(getSharedEvent).mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
    load()
    expect(await screen.findByText('This link is no longer available')).toBeInTheDocument()
  })
})
