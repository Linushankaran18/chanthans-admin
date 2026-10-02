import { ImagePlus } from 'lucide-react'
import { Button } from '../ui/Button'

export function HeroEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <ImagePlus className="h-10 w-10 text-ink-mute" aria-hidden />
      <h2 className="mt-4 font-display text-2xl font-semibold">No hero images yet.</h2>
      <p className="mt-2 max-w-sm text-ink-soft">Upload your first hero image to display it on the website homepage.</p>
      <Button className="mt-6" onClick={onAdd}>Add Hero Image</Button>
    </div>
  )
}
