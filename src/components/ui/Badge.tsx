export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-600' : 'bg-stone-500'}`} aria-hidden />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
