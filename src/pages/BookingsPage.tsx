import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, Plus, SearchX } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { buttonClasses, Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Pagination } from '../components/ui/Pagination'
import { BookingFilters } from '../components/bookings/BookingFilters'
import { BookingTable } from '../components/bookings/BookingTable'
import { BookingCard } from '../components/bookings/BookingCard'
import { BookingListSkeleton } from '../components/bookings/BookingListSkeleton'
import { useBookingList, useServiceTypes } from '../hooks/useBookings'
import { PAGE_SIZE, useBookingFilters } from '../hooks/useBookingFilters'
import { loadFailedMessage } from '../utils/errors'

export default function BookingsPage() {
  const { filters, params, page, setFilters, setPage, clear, activeCount } = useBookingFilters()
  const list = useBookingList(params)
  const serviceTypes = useServiceTypes()
  const data = list.data

  // If the URL points past the last page (e.g. after deleting), fall back.
  useEffect(() => {
    if (data && data.pages > 0 && page > data.pages) setPage(data.pages)
  }, [data, page, setPage])

  const newButton = (
    <Link to="/dashboard/bookings/new" className={buttonClasses('primary')}>
      <Plus className="h-4 w-4" aria-hidden /> New booking
    </Link>
  )

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Studio"
        title="Bookings"
        description="Every session, from first inquiry to final delivery."
        actions={newButton}
      />

      <BookingFilters filters={filters} serviceTypes={serviceTypes.data ?? []} activeCount={activeCount} onChange={setFilters} onClear={clear} />

      {list.isLoading ? (
        <BookingListSkeleton />
      ) : list.isError && !data ? (
        <ErrorState message={loadFailedMessage(list.error, 'your bookings')} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : data && data.items.length === 0 ? (
        activeCount > 0 ? (
          <EmptyState
            icon={SearchX}
            title="No bookings match your filters"
            description="Try a different search, or clear the filters to see everything."
            action={<Button variant="secondary" onClick={clear}>Clear filters</Button>}
          />
        ) : (
          <EmptyState
            icon={CalendarPlus}
            title="No bookings yet"
            description="Add your first booking to start tracking sessions, payments and deliveries."
            action={<Link to="/dashboard/bookings/new" className={buttonClasses('primary')}>Add your first booking</Link>}
          />
        )
      ) : data ? (
        <div aria-busy={list.isPlaceholderData} className={`transition-opacity duration-300 ${list.isPlaceholderData ? 'opacity-60' : ''}`}>
          {list.isError && (
            <div className="mb-4"><ErrorState message="We couldn't refresh the list." onRetry={() => list.refetch()} retrying={list.isFetching} /></div>
          )}
          <p className="mb-3 text-sm text-ink-mute" aria-live="polite">{data.total} booking{data.total === 1 ? '' : 's'}</p>
          <div className="hidden md:block"><BookingTable bookings={data.items} /></div>
          <div className="space-y-3 md:hidden">{data.items.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
          <Pagination page={data.page} pages={data.pages} total={data.total} pageSize={data.page_size || PAGE_SIZE} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        </div>
      ) : null}
    </div>
  )
}
