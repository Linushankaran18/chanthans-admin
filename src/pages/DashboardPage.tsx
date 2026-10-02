import { Link } from 'react-router-dom'
import { Image as ImageIcon } from 'lucide-react'
import { useActiveHeroCount } from '../hooks/useActiveHeroCount'
import { Skeleton } from '../components/ui/Skeleton'

export default function DashboardPage() {
  const { count, isLoading, isError } = useActiveHeroCount()
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Welcome back</h1>
      <p className="mt-2 text-ink-soft">Here is a quick look at your website.</p>

      <div className="mt-10 max-w-md rounded-2xl border border-paper-line bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-ink-soft">
          <ImageIcon className="h-5 w-5" aria-hidden />
          <h2 className="text-sm font-medium uppercase tracking-wide">Hero Images</h2>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <Skeleton className="h-12 w-16" />
          ) : isError ? (
            <p className="text-sm text-ink-soft">Unable to load the count right now.</p>
          ) : (
            <p className="font-display text-6xl font-semibold leading-none">{count}</p>
          )}
          <p className="mt-2 text-sm text-ink-soft">active on the homepage</p>
        </div>
        <Link
          to="/dashboard/hero-images"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Manage Hero Images
        </Link>
      </div>
    </div>
  )
}
