export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur ${
        active ? 'bg-white/95 text-success' : 'bg-white/90 text-ink-mute'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-muted-light'}`} aria-hidden />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
