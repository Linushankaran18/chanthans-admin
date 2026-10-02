import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { formatMoneyIn, parseAmount } from '../../utils/format'
import type { Invoice } from '../../types/invoice'

interface Props {
  invoice: Invoice
  loading: boolean
  error?: string | null
  onCancel: () => void
  onSave: (amountPaid: number) => void
}

/** Sets the cumulative amount paid so far. The API derives the balance and status. */
export function RecordPaymentModal({ invoice, loading, error, onCancel, onSave }: Props) {
  const [value, setValue] = useState(String(invoice.amount_paid))
  const [touched, setTouched] = useState(false)
  const money = (v: number) => formatMoneyIn(v, invoice.currency)

  const n = parseAmount(value)
  let problem: string | undefined
  if (n === null) problem = 'Enter a valid amount, like 450 or 450.00.'
  else if (n < 0) problem = 'Amount cannot be negative.'
  else if (n > invoice.total_amount) problem = `Amount paid cannot be more than the invoice total (${money(invoice.total_amount)}).`
  else if (Math.round(n * 100) / 100 !== n) problem = 'Use at most two decimal places.'

  return (
    <Modal title="Record payment" description={`Total paid so far on ${invoice.invoice_number}. Invoice total: ${money(invoice.total_amount)}.`} onClose={onCancel} busy={loading}>
      <form
        noValidate
        onSubmit={(e) => { e.preventDefault(); setTouched(true); if (!problem && n !== null) onSave(n) }}
        className="space-y-5"
      >
        <TextField label="Amount paid" inputMode="decimal" autoComplete="off" autoFocus value={value} onChange={(e) => setValue(e.target.value)} onBlur={() => setTouched(true)} error={touched ? problem ?? (error ?? undefined) : error ?? undefined} />
        <p className="text-sm text-ink-soft" aria-live="polite">
          Balance due after saving: <span className="font-medium text-ink">{problem || n === null ? '—' : money(invoice.total_amount - n)}</span>
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>Save payment</Button>
        </div>
      </form>
    </Modal>
  )
}
