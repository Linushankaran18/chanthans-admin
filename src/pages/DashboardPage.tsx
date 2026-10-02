import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, CalendarDays, CalendarPlus, Clock, Image as ImageIcon, PackageCheck, Pencil } from 'lucide-react'
import { useActiveHeroCount } from '../hooks/useActiveHeroCount'
import { useDashboardSummary } from '../hooks/useDashboard'
import { useMe } from '../hooks/useMe'
import { Skeleton } from '../components/ui/Skeleton'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { buttonClasses } from '../components/ui/Button'
import { ScheduleList } from '../components/dashboard/ScheduleList'
import { displayName, formatRelativeDay, formatTime, greetingFor } from '../utils/format'
import { loadFailedMessage } from '../utils/errors'
import type { DashboardSummary } from '../types/dashboard'

function nextCaption(s: DashboardSummary) {
  const n = s.next_booking
  if (!n) return s.today_count > 0 ? 'Nothing else scheduled after today.' : 'Nothing scheduled yet — enjoy the quiet.'
  const when = n.event_date === s.today ? formatTime(n.start_time) : `${formatRelativeDay(n.event_date, s.today)}, ${formatTime(n.start_time)}`
  return <><span className="font-medium text-white">Next:</span> {when} — {n.service_type}</>
}

function StatsSkeleton() {
  return (
    <div role="status" aria-label="Loading overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <Skeleton className="h-52 sm:col-span-2 lg:col-span-4" />
      <Skeleton className="h-52 sm:col-span-2 lg:col-span-2" />
      <Skeleton className="h-36 lg:col-span-2" /><Skeleton className="h-36 lg:col-span-2" /><Skeleton className="h-36 sm:col-span-2 lg:col-span-2" />
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div role="status" aria-label="Loading schedule" className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4"><Skeleton className="h-14 w-14" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-1/2" /></div><Skeleton className="h-6 w-20 !rounded-full" /></div>
      ))}
    </div>
  )
}

function WebsiteCard() {
  const { count, isLoading, isError, refetch } = useActiveHeroCount()
  return (
    <Card as="section" className="relative overflow-hidden">
      <CardHeader title="Website" icon={ImageIcon} />
      <div className="flex items-end justify-between gap-4">
        <div>
          {isLoading ? <Skeleton className="h-10 w-14" /> : isError ? (
            <p className="text-sm text-ink-soft">Couldn't load the count. <button type="button" onClick={() => refetch()} className="font-medium text-accent underline underline-offset-2">Retry</button></p>
          ) : (
            <p className="text-brand-gradient font-sans text-4xl font-light tabular-nums leading-none">{count}</p>
          )}
          <p className="mt-2 text-sm text-ink-soft">hero images active on the homepage</p>
        </div>
        <Link to="/dashboard/hero-images" className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium text-accent hover:bg-[#f5effb]">
          Manage <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const me = useMe()
  const summary = useDashboardSummary()
  const name = displayName(me.data)
  const s = summary.data
  const pending = s ? s.status_counts.INQUIRY + s.status_counts.PENDING : 0

  return (
    <div className="animate-fade-up">
      <p className="eyebrow">Studio Dashboard</p>
      <h1 className="page-title mt-3 break-words sm:!text-6xl">
        {greetingFor()}{name && <>, <span className="animate-fade-in">{name}</span></>}
      </h1>
      <p className="mt-3 text-ink-soft">Here's what's happening with the studio today.</p>

      <div className="mt-10 space-y-8">
        {summary.isLoading ? (
          <StatsSkeleton />
        ) : summary.isError || !s ? (
          <ErrorState message={loadFailedMessage(summary.error, 'your studio overview')} onRetry={() => summary.refetch()} retrying={summary.isFetching} />
        ) : (
          <section aria-label="Studio overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <StatCard
              variant="hero"
              className="sm:col-span-2 lg:col-span-4"
              label="Today's Bookings"
              icon={CalendarCheck}
              value={s.today_count}
              caption={nextCaption(s)}
              to={`/dashboard/bookings?date_from=${s.today}&date_to=${s.today}&sort=date_asc`}
            />
            <StatCard
              variant="accent"
              className="sm:col-span-2 lg:col-span-2"
              label="Upcoming"
              icon={CalendarDays}
              value={s.upcoming_count}
              caption="confirmed sessions ahead"
              to={`/dashboard/bookings?status=CONFIRMED&date_from=${s.today}&sort=date_asc`}
            />
            <StatCard
              className="lg:col-span-2"
              label="Pending"
              icon={Clock}
              value={pending}
              caption={`${s.status_counts.INQUIRY} new ${s.status_counts.INQUIRY === 1 ? 'inquiry' : 'inquiries'}`}
              to="/dashboard/bookings?status=INQUIRY,PENDING"
            />
            <StatCard className="lg:col-span-2" label="Editing" icon={Pencil} value={s.status_counts.EDITING} caption="galleries in progress" to="/dashboard/bookings?status=EDITING" />
            <StatCard className="sm:col-span-2 lg:col-span-2" label="Ready for Delivery" icon={PackageCheck} value={s.ready_for_delivery_count} caption="waiting to be sent to clients" to="/dashboard/bookings?status=READY" />
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card as="section" className="lg:col-span-3">
            <CardHeader
              title="Upcoming Bookings"
              icon={CalendarDays}
              action={<Link to="/dashboard/bookings" className="inline-flex min-h-[44px] items-center text-sm font-medium text-accent hover:underline">View all</Link>}
            />
            {summary.isLoading ? <ScheduleSkeleton /> : summary.isError || !s ? (
              <p className="py-6 text-sm text-ink-soft">The schedule couldn't be loaded. Use "Try again" above to reload.</p>
            ) : s.upcoming.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarPlus}
                title="No upcoming bookings"
                description="When you confirm a booking, it shows up here in date order."
                action={<Link to="/dashboard/bookings/new" className={buttonClasses('primary')}>New booking</Link>}
              />
            ) : (
              <ScheduleList bookings={s.upcoming} today={s.today} />
            )}
          </Card>

          <div className="min-w-0 space-y-6 lg:col-span-2">
            <Card as="section">
              <CardHeader title="Today" icon={CalendarCheck} />
              {summary.isLoading ? <ScheduleSkeleton /> : !s ? (
                <p className="text-sm text-ink-soft">Not available right now.</p>
              ) : s.today_bookings.length === 0 ? (
                <p className="py-2 text-sm text-ink-soft">Nothing booked for today.</p>
              ) : (
                <ScheduleList bookings={s.today_bookings} today={s.today} showDay={false} />
              )}
            </Card>
            <WebsiteCard />
          </div>
        </div>
      </div>
    </div>
  )
}
