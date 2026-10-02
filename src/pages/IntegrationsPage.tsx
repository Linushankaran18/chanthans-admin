import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CalendarCheck2, CalendarDays, Link2, Unplug } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton } from '../components/ui/Skeleton'
import { GOOGLE_CALENDAR_KEY, useConnectGoogleCalendar, useDisconnectGoogleCalendar, useGoogleCalendarStatus } from '../hooks/useGoogleCalendar'
import { useToast } from '../contexts/ToastContext'
import { calendarActionMessage, googleReturnMessage, loadFailedMessage } from '../utils/errors'
import { formatDateTime, formatRelativeTime } from '../utils/format'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-sm text-ink-mute">{label}</dt>
      <dd className="min-w-0 break-all text-sm font-medium text-ink sm:text-right">{children}</dd>
    </div>
  )
}

export default function IntegrationsPage() {
  const [sp, setSp] = useSearchParams()
  const qc = useQueryClient()
  const toast = useToast()
  const status = useGoogleCalendarStatus()
  const connect = useConnectGoogleCalendar()
  const disconnect = useDisconnectGoogleCalendar()
  const [confirm, setConfirm] = useState(false)
  const handled = useRef(false)

  // Handle ?google=connected|error&reason= on return from Google, then clean the URL.
  useEffect(() => {
    const result = sp.get('google')
    if (!result || handled.current) return
    handled.current = true
    if (result === 'connected') {
      toast.success('Google Calendar connected.')
      qc.invalidateQueries({ queryKey: GOOGLE_CALENDAR_KEY })
    } else {
      toast.error(googleReturnMessage(sp.get('reason')))
    }
    setSp({}, { replace: true })
  }, [sp, setSp, toast, qc])

  function startConnect() {
    connect.mutate(undefined, { onError: (e) => toast.error(calendarActionMessage(e)) })
  }

  function doDisconnect() {
    disconnect.mutate(undefined, {
      onSuccess: () => { setConfirm(false); toast.success('Google Calendar disconnected.') },
      onError: (e) => { setConfirm(false); toast.error(calendarActionMessage(e)) },
    })
  }

  const s = status.data
  const needsReconnect = !!s?.needs_reconnect
  const connected = !!s?.connected && !needsReconnect

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="Settings" title="Integrations" description="Connect the tools you use so bookings stay in sync automatically." />

      <Card as="section" className="max-w-2xl !p-0 overflow-hidden" >
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f1fb] text-[#17508f]"><CalendarDays className="h-6 w-6" aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="font-display text-3xl font-normal leading-tight">Google Calendar</h2>
                {s && (
                  connected ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe3cf] bg-success-soft px-3 py-0.5 text-xs font-medium text-success"><CalendarCheck2 className="h-3.5 w-3.5" aria-hidden /> Connected</span>
                  ) : needsReconnect ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f2dca6] bg-[#fdf3dc] px-3 py-0.5 text-xs font-medium text-[#7a4b00]"><AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Needs reconnecting</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-cream-deep px-3 py-0.5 text-xs font-medium text-ink-soft"><Unplug className="h-3.5 w-3.5" aria-hidden /> Not connected</span>
                  )
                )}
              </div>
              <p className="mt-1 text-sm text-ink-soft">Confirmed bookings are added to your calendar, updated when you reschedule, and removed if cancelled.</p>
            </div>
          </div>

          <div className="mt-6">
            {status.isLoading ? (
              <div role="status" aria-label="Loading integration status" className="space-y-3"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-11 w-40 !rounded-full" /></div>
            ) : status.isError || !s ? (
              <ErrorState message={loadFailedMessage(status.error, 'the integration status')} onRetry={() => status.refetch()} retrying={status.isFetching} />
            ) : !s.configured ? (
              <Alert tone="info">Google Calendar isn't set up for this studio yet. Ask your developer to add the Google credentials, then come back here to connect.</Alert>
            ) : (
              <>
                {needsReconnect && <div className="mb-4"><Alert>Google has asked you to sign in again, so new bookings can't reach your calendar right now. Reconnect to resume syncing.</Alert></div>}
                {(connected || needsReconnect) && (
                  <dl className="divide-y divide-line rounded-xl border border-line bg-cream px-4">
                    <Row label="Google account">{s.google_email ?? '—'}</Row>
                    <Row label="Calendar">{s.calendar_name || s.calendar_id || 'Primary calendar'}</Row>
                    <Row label="Last synced"><span title={formatDateTime(s.last_synced_at)}>{s.last_synced_at ? formatRelativeTime(s.last_synced_at) : 'Not synced yet'}</span></Row>
                  </dl>
                )}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  {connected ? (
                    <Button variant="secondary" onClick={() => setConfirm(true)}><Unplug className="h-4 w-4" aria-hidden /> Disconnect</Button>
                  ) : (
                    <>
                      <Button onClick={startConnect} loading={connect.isPending}>{!connect.isPending && <Link2 className="h-4 w-4" aria-hidden />}{needsReconnect ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}</Button>
                      {needsReconnect && <Button variant="ghost" onClick={() => setConfirm(true)}>Disconnect</Button>}
                    </>
                  )}
                </div>
                {!connected && !needsReconnect && <p className="mt-3 text-xs text-ink-mute">You'll be taken to Google to approve access, then brought back here.</p>}
              </>
            )}
          </div>
        </div>
      </Card>

      {confirm && (
        <ConfirmDialog
          title="Disconnect Google Calendar?"
          description="New and updated bookings will stop appearing on your Google Calendar. Events that were already created stay where they are."
          cancelLabel="Stay Connected"
          confirmLabel="Disconnect"
          loading={disconnect.isPending}
          onCancel={() => setConfirm(false)}
          onConfirm={doDisconnect}
        />
      )}
    </div>
  )
}
