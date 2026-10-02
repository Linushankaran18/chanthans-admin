import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message, onRetry, retrying }: { message: string; onRetry?: () => void; retrying?: boolean }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-red-700" aria-hidden />
      <p className="mt-3 text-base font-medium text-red-900">{message}</p>
      {onRetry && <Button variant="secondary" className="mt-5" onClick={onRetry} loading={retrying}>Try again</Button>}
    </div>
  )
}
