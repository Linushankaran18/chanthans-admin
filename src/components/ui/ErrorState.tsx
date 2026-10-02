import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message, onRetry, retrying }: { message: string; onRetry?: () => void; retrying?: boolean }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-danger/20 bg-danger-soft px-6 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
      <p className="mt-3 font-display text-2xl text-[#7d1a2b]">{message}</p>
      {onRetry && <Button variant="secondary" className="mt-5" onClick={onRetry} loading={retrying}>Try again</Button>}
    </div>
  )
}
