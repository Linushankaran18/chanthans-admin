import { useState } from 'react'
import { Check, Copy, Link2, Link2Off, MessageCircle, Share2 } from 'lucide-react'
import type { Booking } from '../../types/booking'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { useBookingShare, useEnableShare, useRevokeShare } from '../../hooks/useBookings'
import { useToast } from '../../contexts/ToastContext'
import { actionFailedMessage } from '../../utils/errors'
import { formatDateLong, formatTimeRange } from '../../utils/format'

/** WhatsApp message with the link; deliberately only date, time, venue and link. */
export function whatsappShareUrl(b: Pick<Booking, 'service_type' | 'customer_name' | 'event_date' | 'start_time' | 'end_time' | 'location'>, link: string): string {
  const lines = [
    `*${b.service_type} — ${b.customer_name}*`,
    `${formatDateLong(b.event_date)}, ${formatTimeRange(b.start_time, b.end_time)}`,
    ...(b.location ? [b.location] : []),
    '',
    `Event details & add to calendar: ${link}`,
  ]
  return `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`
}

/** Share the event with the team via a private, read-only link (no amounts, phone or email). */
export function ShareCard({ booking: b }: { booking: Booking }) {
  const toast = useToast()
  const link = useBookingShare(b.id, b.is_shared)
  const enable = useEnableShare()
  const revoke = useRevokeShare()
  const [copied, setCopied] = useState(false)
  const url = b.is_shared ? link.data?.url : undefined

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy the link. Select it and copy manually.')
    }
  }

  return (
    <Card as="section">
      <CardHeader title="Share with team" icon={Share2} />
      {!b.is_shared ? (
        <>
          <p className="mb-4 text-sm text-ink-soft">Create a private link that shows the event name, date, time and venue, with an "Add to calendar" button. Amounts, phone numbers and email addresses are never shown.</p>
          <Button
            variant="secondary"
            loading={enable.isPending}
            onClick={() => enable.mutate(b.id, { onError: (e) => toast.error(actionFailedMessage(e, 'create the share link')) })}
          >
            <Link2 className="h-4 w-4" aria-hidden /> Create share link
          </Button>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-soft">Anyone with this link can see the event details until the day after the event, or until you turn it off.</p>
          <label className="sr-only" htmlFor="share-link">Share link</label>
          <input
            id="share-link"
            readOnly
            value={url ?? 'Loading link…'}
            onFocus={(e) => e.currentTarget.select()}
            className="mb-4 min-h-[44px] w-full rounded-xl border border-line-strong bg-cream/60 px-3 text-sm text-ink-soft"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="!px-4" onClick={copy} disabled={!url}>
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} {copied ? 'Copied' : 'Copy link'}
            </Button>
            {url && (
              <a href={whatsappShareUrl(b, url)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#1f8f4e] px-4 text-sm font-medium tracking-wide text-white transition-all duration-300 ease-lux hover:-translate-y-0.5 hover:bg-[#187a42]">
                <MessageCircle className="h-4 w-4" aria-hidden /> Share on WhatsApp
              </a>
            )}
            <Button
              variant="ghost"
              className="!px-4"
              loading={revoke.isPending}
              onClick={() => revoke.mutate(b.id, { onSuccess: () => toast.success('Share link turned off.'), onError: (e) => toast.error(actionFailedMessage(e, 'turn off the share link')) })}
            >
              <Link2Off className="h-4 w-4" aria-hidden /> Turn off
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
