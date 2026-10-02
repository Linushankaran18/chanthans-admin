import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, SearchX } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button, buttonClasses } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Pagination } from '../components/ui/Pagination'
import { InvoiceFilters } from '../components/invoices/InvoiceFilters'
import { InvoiceTable } from '../components/invoices/InvoiceTable'
import { InvoiceCard } from '../components/invoices/InvoiceCard'
import { InvoiceListSkeleton } from '../components/invoices/InvoiceListSkeleton'
import { useInvoiceList } from '../hooks/useInvoices'
import { INVOICE_PAGE_SIZE, useInvoiceFilters } from '../hooks/useInvoiceFilters'
import { loadFailedMessage } from '../utils/errors'

export default function InvoicesPage() {
  const { filters, params, page, setFilters, setPage, clear, activeCount } = useInvoiceFilters()
  const list = useInvoiceList(params)
  const data = list.data

  useEffect(() => {
    if (data && data.pages > 0 && page > data.pages) setPage(data.pages)
  }, [data, page, setPage])

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Studio"
        title="Invoices"
        description="Every invoice, from draft to paid. Create one from a booking."
        actions={<Link to="/dashboard/bookings" className={buttonClasses('secondary')}>View bookings</Link>}
      />

      <InvoiceFilters filters={filters} activeCount={activeCount} onChange={setFilters} onClear={clear} />

      {list.isLoading ? (
        <InvoiceListSkeleton />
      ) : list.isError && !data ? (
        <ErrorState message={loadFailedMessage(list.error, 'your invoices')} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : data && data.items.length === 0 ? (
        activeCount > 0 ? (
          <EmptyState
            icon={SearchX}
            title="No invoices match your filters"
            description="Try a different search, or clear the filters to see everything."
            action={<Button variant="secondary" onClick={clear}>Clear filters</Button>}
          />
        ) : (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Create an invoice from a booking to start tracking studio payments."
            action={<Link to="/dashboard/bookings" className={buttonClasses('primary')}>View Bookings</Link>}
          />
        )
      ) : data ? (
        <div aria-busy={list.isPlaceholderData} className={`transition-opacity duration-300 ${list.isPlaceholderData ? 'opacity-60' : ''}`}>
          {list.isError && <div className="mb-4"><ErrorState message="We couldn't refresh the list." onRetry={() => list.refetch()} retrying={list.isFetching} /></div>}
          <p className="mb-3 text-sm text-ink-mute" aria-live="polite">{data.total} invoice{data.total === 1 ? '' : 's'}</p>
          <div className="hidden md:block"><InvoiceTable invoices={data.items} /></div>
          <div className="space-y-3 md:hidden">{data.items.map((inv) => <InvoiceCard key={inv.id} invoice={inv} />)}</div>
          <Pagination page={data.page} pages={data.pages} total={data.total} pageSize={data.page_size || INVOICE_PAGE_SIZE} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        </div>
      ) : null}
    </div>
  )
}
