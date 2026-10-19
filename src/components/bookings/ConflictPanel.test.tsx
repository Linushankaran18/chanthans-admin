import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../../test/render'
import { ConflictPanel } from './ConflictPanel'

const conflicts = [{ id: 'b2', booking_number: 'BK-2026-0002', customer_name: 'Marcus Lee', service_type: 'Portrait', event_date: '2026-11-15', start_time: '09:00:00', end_time: '12:00:00', status: 'CONFIRMED' as const }]

describe('ConflictPanel', () => {
  it('offers "Confirm Anyway" only when an override handler is given', async () => {
    const onOverride = vi.fn()
    const { unmount } = renderApp(<ConflictPanel conflicts={conflicts} onChangeTime={() => {}} onOverride={onOverride} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Confirm Anyway' }))
    expect(onOverride).toHaveBeenCalledOnce()
    unmount()
    renderApp(<ConflictPanel conflicts={conflicts} onChangeTime={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Confirm Anyway' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change Time' })).toBeInTheDocument()
  })
})
