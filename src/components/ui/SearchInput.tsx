import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  /** Debounce before calling onChange (ms). */
  delay?: number
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search', label = 'Search', delay = 300, className = '' }: Props) {
  const [local, setLocal] = useState(value)
  const timer = useRef<number | undefined>(undefined)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Keep in sync when the value changes externally (e.g. "Clear filters").
  useEffect(() => { setLocal(value) }, [value])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function update(next: string) {
    setLocal(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onChangeRef.current(next), delay)
  }
  function clear() {
    window.clearTimeout(timer.current)
    setLocal('')
    onChange('')
  }

  return (
    <div role="search" className={`relative ${className}`}>
      <label htmlFor="booking-search" className="sr-only">{label}</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" aria-hidden />
      <input
        id="booking-search"
        type="search"
        inputMode="search"
        value={local}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="input-field pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden"
      />
      {local && (
        <button type="button" onClick={clear} aria-label="Clear search" className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-mute hover:text-ink">
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
