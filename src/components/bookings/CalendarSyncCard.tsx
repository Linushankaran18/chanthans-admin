import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarCheck2, CalendarX2, CalendarDays, RefreshCw } from 'lucide-react'
import type { Booking } from '../../types/booking'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { useRetryCalendarSync } from '../../hooks/useBookings'
import { useToast } from '../../contexts/ToastContext'
import { calendarActionMessage } from '../../utils/errors'
import { formatDateTime, formatRelativeTime } from '../../utils/format'

export function CalendarSyncCard({ booking }: { booking: Booking }) {
  const retry = useRetryCalendarSync()
  const toast = useToast()
  const { calendar_sync_status: sync, status } = booking
  const cancelled = status === 'CANCELLED'
  const notYetConfirmed = status === 'INQUIRY' || status === 'PENDING'

  function run() {
    retry.mutate(booking.id, {
      onSuccess: (b) => {
        if (b.calendar_sync_status === 'FAILED') toast.error('Google Calendar could not be updated. Please try again.')
        else toast.success('Google Calendar updated.')
      },
      onError: (e) => toast.error(calendarActionMessage(e)),
    })
  }

  let icon = <CalendarX2 className="h-5 w-5" aria-hidden />
  let tone = 'bg-cream-deep text-ink-soft'
  let title = 'Not synced'
  let body = 'This booking is not on your Google Calendar.'
  let canRetry = false

  if (sync === 'SYNCED') {
    icon = <CalendarCheck2 className="h-5 w-5" aria-hidden />
    tone = 'bg-success-soft text-success'
    title = 'Synced'
    body = booking.calendar_synced_at ? `Last synced ${formatRelativeTime(booking.calendar_synced_at)}` : 'On your Google Calendar.'
    canRetry = !cancelled
  } else if (sync === 'FAILED') {
    icon = <AlertTriangle className="h-5 w-5" aria-hidden />
    tone = 'bg-danger-soft text-danger'
    title = 'Sync failed'
    body = booking.calendar_sync_error || 'We could not update Google Calendar for this booking.'
    canRetry = true
  } else if (cancelled) {
    body = 'Cancelled bookings are not kept on the calendar.'
  } else if (notYetConfirmed) {
    body = 'This booking is added to Google Calendar once it is confirmed.'
  } else {
    canRetry = true
  }

  return (
    <Card as="section">
      <CardHeader title="Google Calendar" icon={CalendarDays} />
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{title}</p>
          <p className="text-sm text-ink-soft" title={sync === 'SYNCED' ? formatDateTime(booking.calendar_synced_at) : undefined}>{body}</p>
        </div>
      </div>
      {canRetry && (
        <Button variant="secondary" className="mt-4 w-full sm:w-auto" onClick={run} loading={retry.isPending}>
          {!retry.isPending && <RefreshCw className="h-4 w-4" aria-hidden />}
          {sync === 'NOT_SYNCED' ? 'Sync now' : 'Retry sync'}
        </Button>
      )}
      {sync === 'FAILED' && (
        <p className="mt-3 text-xs text-ink-mute">
          If this keeps happening, check the connection on the <Link to="/dashboard/integrations" className="font-medium text-accent underline underline-offset-2">Integrations page</Link>.
        </p>
      )}
    </Card>
  )
}
