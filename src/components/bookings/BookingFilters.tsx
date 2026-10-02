import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { BOOKING_STATUSES, type BookingSort, type BookingStatus } from '../../types/booking'
import type { BookingFilters as Filters } from '../../hooks/useBookingFilters'
import { STATUS_META } from '../../utils/bookingStatus'
import { SearchInput } from '../ui/SearchInput'
import { Select } from '../ui/Select'
import { DateField } from '../ui/DateField'
import { Button } from '../ui/Button'
import { BottomSheet } from '../ui/BottomSheet'

interface Props {
  filters: Filters
  serviceTypes: string[]
  activeCount: number
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}

const SORT_OPTIONS: { value: BookingSort; label: string }[] = [
  { value: 'date_desc', label: 'Newest event first' },
  { value: 'date_asc', label: 'Oldest event first' },
  { value: 'created_desc', label: 'Recently created' },
]

function StatusChips({ value, onChange }: { value: BookingStatus[]; onChange: (v: BookingStatus[]) => void }) {
  function toggle(s: BookingStatus) {
    onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s])
  }
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {BOOKING_STATUSES.map((s) => {
        const meta = STATUS_META[s]
        const on = value.includes(s)
        const Icon = meta.icon
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(s)}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all duration-300 ease-lux sm:min-h-[36px] ${
              on ? 'border-accent bg-accent text-white' : 'border-line-strong bg-white text-ink-soft hover:border-accent/50 hover:text-accent'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}

function ServiceSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const list = value && !options.includes(value) ? [value, ...options] : options
  return (
    <Select label="Service" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All services</option>
      {list.map((s) => <option key={s} value={s}>{s}</option>)}
    </Select>
  )
}

export function BookingFilters({ filters, serviceTypes, activeCount, onChange, onClear }: Props) {
  const [sheet, setSheet] = useState(false)
  const [draft, setDraft] = useState<Filters>(filters)

  function openSheet() { setDraft(filters); setSheet(true) }
  function apply() { onChange({ status: draft.status, service_type: draft.service_type, date_from: draft.date_from, date_to: draft.date_to, sort: draft.sort }); setSheet(false) }

  const sheetFilterCount = activeCount - (filters.search.trim() ? 1 : 0)

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-end gap-3">
        <SearchInput
          className="min-w-0 flex-1"
          value={filters.search}
          onChange={(search) => onChange({ search })}
          placeholder="Search name, phone, email or booking number"
          label="Search bookings"
        />
        {/* Mobile: filter button */}
        <button
          type="button"
          onClick={openSheet}
          className="relative inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-accent/50 hover:text-accent lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters
          {sheetFilterCount > 0 && <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 text-xs text-white">{sheetFilterCount}</span>}
        </button>
      </div>

      {/* Desktop: inline controls */}
      <div className="card-surface hidden space-y-4 p-4 lg:block">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
          <ServiceSelect value={filters.service_type} options={serviceTypes} onChange={(service_type) => onChange({ service_type })} />
          <DateField label="From" value={filters.date_from} max={filters.date_to || undefined} onChange={(e) => onChange({ date_from: e.target.value })} />
          <DateField label="To" value={filters.date_to} min={filters.date_from || undefined} onChange={(e) => onChange({ date_to: e.target.value })} />
          <Select label="Sort by" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as BookingSort })}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <StatusChips value={filters.status} onChange={(status) => onChange({ status })} />
      </div>

      {activeCount > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink-mute" aria-live="polite">{activeCount} filter{activeCount === 1 ? '' : 's'} applied</p>
          <button type="button" onClick={onClear} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium text-accent hover:bg-[#f5effb]">
            <X className="h-4 w-4" aria-hidden /> Clear filters
          </button>
        </div>
      )}

      {sheet && (
        <BottomSheet
          title="Filters"
          onClose={() => setSheet(false)}
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDraft({ ...draft, status: [], service_type: '', date_from: '', date_to: '' })}>Reset</Button>
              <Button className="flex-1" onClick={apply}>Show results</Button>
            </div>
          }
        >
          <div className="space-y-6 pb-2">
            <div>
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Status</p>
              <StatusChips value={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
            </div>
            <ServiceSelect value={draft.service_type} options={serviceTypes} onChange={(service_type) => setDraft({ ...draft, service_type })} />
            <div className="grid grid-cols-1 gap-4">
              <DateField label="From" value={draft.date_from} max={draft.date_to || undefined} onChange={(e) => setDraft({ ...draft, date_from: e.target.value })} />
              <DateField label="To" value={draft.date_to} min={draft.date_from || undefined} onChange={(e) => setDraft({ ...draft, date_to: e.target.value })} />
            </div>
            <Select label="Sort by" value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value as BookingSort })}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
