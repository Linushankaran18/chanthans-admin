import { describe, expect, it } from 'vitest'
import { googleCalendarUrl, mapsUrl } from './calendarLinks'

const event = {
  service_type: 'Wedding',
  customer_name: 'Priya Nair',
  event_date: '2026-11-15',
  start_time: '09:00:00',
  end_time: '17:30:00',
  location: 'Venue, Toronto',
  timezone: 'America/Toronto',
}

describe('googleCalendarUrl', () => {
  it('uses studio-local times with the studio timezone', () => {
    const url = new URL(googleCalendarUrl(event))
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('text')).toBe('Wedding — Priya Nair')
    expect(url.searchParams.get('dates')).toBe('20261115T090000/20261115T173000')
    expect(url.searchParams.get('ctz')).toBe('America/Toronto')
    expect(url.searchParams.get('location')).toBe('Venue, Toronto')
  })

  it('omits location when there is none', () => {
    expect(new URL(googleCalendarUrl({ ...event, location: null })).searchParams.has('location')).toBe(false)
  })
})

describe('mapsUrl', () => {
  it('encodes the address', () => {
    expect(mapsUrl('1 Main St & 2nd')).toBe('https://www.google.com/maps/search/?api=1&query=1%20Main%20St%20%26%202nd')
  })
})
