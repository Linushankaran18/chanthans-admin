import { Ban, Check } from 'lucide-react'
import type { BookingStatus } from '../../types/booking'
import { STATUS_META, TIMELINE_STEPS } from '../../utils/bookingStatus'

/** Horizontal on md+, vertical on mobile. Cancelled replaces the normal flow. */
export function BookingTimeline({ status }: { status: BookingStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft p-4 text-[#7d1a2b]" role="status">
        <Ban className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
        <div>
          <p className="font-medium">This booking was cancelled</p>
          <p className="text-sm">It no longer follows the normal workflow and has been removed from the calendar.</p>
        </div>
      </div>
    )
  }
  const current = TIMELINE_STEPS.indexOf(status)
  return (
    <ol aria-label="Booking progress" className="flex flex-col md:flex-row">
      {TIMELINE_STEPS.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        const Icon = STATUS_META[step].icon
        const last = i === TIMELINE_STEPS.length - 1
        return (
          <li key={step} aria-current={state === 'current' ? 'step' : undefined} className="relative flex flex-1 gap-3 pb-5 md:flex-col md:items-center md:gap-2 md:pb-0 md:text-center">
            {!last && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 md:left-1/2 md:top-[15px] md:h-0.5 md:w-full ${i < current ? 'bg-accent' : 'bg-line-strong'}`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                state === 'done'
                  ? 'border-accent bg-accent text-white'
                  : state === 'current'
                    ? 'border-accent bg-white text-accent ring-4 ring-accent/15'
                    : 'border-line-strong bg-white text-muted'
              }`}
            >
              {state === 'done' ? <Check className="h-4 w-4" aria-hidden /> : <Icon className="h-3.5 w-3.5" aria-hidden />}
            </span>
            <span className="min-w-0 pt-1 md:pt-0 md:px-1">
              <span className={`block text-sm ${state === 'todo' ? 'text-ink-mute' : 'font-medium text-ink'}`}>{STATUS_META[step].label}</span>
              <span className={`block text-xs ${state === 'current' ? 'font-medium text-accent' : 'text-ink-mute'}`}>
                {state === 'done' ? 'Completed' : state === 'current' ? 'Current stage' : 'Upcoming'}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
