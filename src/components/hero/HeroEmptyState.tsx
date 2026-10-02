import { ImagePlus } from 'lucide-react'
import { Button } from '../ui/Button'

export function HeroEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-white px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5effb] text-accent"><ImagePlus className="h-7 w-7" aria-hidden /></span>
      <h2 className="mt-4 font-display text-3xl font-normal">No hero images yet.</h2>
      <p className="mt-2 max-w-sm text-ink-soft">Upload your first hero image to display it on the website homepage.</p>
      <Button className="mt-6" onClick={onAdd}>Add Hero Image</Button>
    </div>
  )
}
