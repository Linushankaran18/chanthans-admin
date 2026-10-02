import { CheckCircle2 } from 'lucide-react'
import { formatMoney } from '../../utils/format'

interface Props {
  total: number | null
  deposit: number | null
  /** Optional invalid state to tint the balance. */
  invalid?: boolean
  className?: string
}

/** Total / Deposit / Balance computed in the UI. */
export function PaymentSummary({ total, deposit, invalid, className = '' }: Props) {
  const balance = total === null ? null : total - (deposit ?? 0)
  const paid = balance !== null && balance <= 0 && total !== null && total > 0
  return (
    <div className={`rounded-xl border border-line bg-cream p-4 ${className}`}>
      <dl className="space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-4"><dt className="text-ink-mute">Total</dt><dd className="font-medium text-ink">{formatMoney(total)}</dd></div>
        <div className="flex items-baseline justify-between gap-4"><dt className="text-ink-mute">Deposit</dt><dd className="font-medium text-ink">{formatMoney(deposit ?? (total === null ? null : 0))}</dd></div>
        <div className="h-px bg-line-strong" aria-hidden />
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-medium text-ink">Balance due</dt>
          <dd className={`font-sans text-2xl font-medium tabular-nums leading-none ${invalid ? 'text-danger' : 'text-ink'}`}>
            {invalid || balance === null ? '—' : formatMoney(Math.max(balance, 0))}
          </dd>
        </div>
      </dl>
      {paid && !invalid && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-success"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Paid in full</p>
      )}
      {total === null && <p className="mt-3 text-xs text-ink-mute">Add a total to see the balance.</p>}
    </div>
  )
}
