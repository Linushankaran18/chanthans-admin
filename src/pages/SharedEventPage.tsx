import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, CalendarPlus, Clock, Download, LinkIcon, MapPin } from 'lucide-react'
import { getSharedEvent, sharedEventIcsUrl } from '../api/sharedEvents'
import { Skeleton } from '../components/ui/Skeleton'
import { googleCalendarUrl, mapsUrl } from '../utils/calendarLinks'
import { isNotFound } from '../utils/errors'
import { formatDateLong, formatTimeRange } from '../utils/format'

const buttonBase = 'inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-wide transition-all duration-300 ease-lux'

/** Public, read-only event page for team members. Shows no amounts, phone numbers or emails. */
export default function SharedEventPage() {
  const { token = '' } = useParams()
  const query = useQuery({
    queryKey: ['shared-event', token],
    queryFn: () => getSharedEvent(token),
    retry: (count, error) => !isNotFound(error) && count < 1,
  })

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const e = query.data

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="eyebrow mb-3 text-center">Chanthans · Event details</p>
      <div className="card-surface p-6 sm:p-8">
        {query.isLoading ? (
          <div role="status" aria-label="Loading event" className="space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-24 w-full !rounded-xl" /></div>
        ) : query.isError || !e ? (
          <div role="alert" className="text-center">
            <LinkIcon className="mx-auto mb-3 h-8 w-8 text-ink-mute" aria-hidden />
            <h1 className="font-display text-3xl">{isNotFound(query.error) ? 'This link is no longer available' : "We couldn't load this event"}</h1>
            <p className="mt-2 text-sm text-ink-soft">
              {isNotFound(query.error) ? 'It may have expired or been turned off. Ask for a new link.' : 'Please check your connection and try again.'}
            </p>
            {!isNotFound(query.error) && <button type="button" onClick={() => query.refetch()} className={`${buttonBase} mt-5 border border-line-strong bg-white text-ink hover:border-accent/50 hover:text-accent`}>Try again</button>}
          </div>
        ) : (
          <>
            {e.status === 'CANCELLED' && <p role="status" className="mb-4 rounded-xl bg-danger-soft px-4 py-2 text-center text-sm font-medium text-danger">This event has been cancelled</p>}
            <h1 className="font-display text-4xl font-light leading-tight">{e.service_type}</h1>
            <p className="mt-1 text-ink-soft">{e.customer_name}</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden /><div><dt className="sr-only">Date</dt><dd className="font-medium">{formatDateLong(e.event_date)}</dd></div></div>
              <div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden /><div><dt className="sr-only">Time</dt><dd className="font-medium">{formatTimeRange(e.start_time, e.end_time)}</dd></div></div>
              {e.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <div className="min-w-0"><dt className="sr-only">Venue</dt><dd className="break-words font-medium">{e.location}</dd>
                    <a href={mapsUrl(e.location)} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Open in Maps</a>
                  </div>
                </div>
              )}
            </dl>
            {e.status !== 'CANCELLED' && (
              <div className="mt-8 space-y-3">
                <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className={`${buttonBase} bg-gradient-to-br from-accent to-brand-aubergine text-white hover:-translate-y-0.5`}>
                  <CalendarPlus className="h-4 w-4" aria-hidden /> Add to Google Calendar
                </a>
                <a href={sharedEventIcsUrl(token)} className={`${buttonBase} border border-line-strong bg-white text-ink hover:border-accent/50 hover:text-accent`}>
                  <Download className="h-4 w-4" aria-hidden /> Apple / Outlook (.ics)
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
