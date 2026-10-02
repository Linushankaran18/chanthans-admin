import { ArrowLeft, ArrowRight, Pencil, Power, Trash2 } from 'lucide-react'
import { StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { HeroImage } from '../../types/heroImage'

interface Props {
  image: HeroImage
  isFirst: boolean
  isLast: boolean
  statusLoading: boolean
  reorderDisabled: boolean
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
  onMove: (direction: -1 | 1) => void
}

export function HeroImageCard({ image, isFirst, isLast, statusLoading, reorderDisabled, onEdit, onToggle, onDelete, onMove }: Props) {
  const name = image.title || 'Untitled image'
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-paper-line bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-stone-100">
        <img
          src={image.image_url}
          alt={image.alt_text || image.title || 'Hero image'}
          loading="lazy"
          className={`h-full w-full object-cover ${image.is_active ? '' : 'opacity-60 grayscale'}`}
        />
        <div className="absolute left-3 top-3"><StatusBadge active={image.is_active} /></div>
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink shadow-sm">
          Order {image.display_order}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-semibold">{name}</h3>
          {image.subtitle ? <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{image.subtitle}</p> : <p className="mt-0.5 text-sm text-ink-mute">No subtitle</p>}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onEdit} className="flex-1 sm:flex-none"><Pencil className="h-4 w-4" aria-hidden />Edit</Button>
          <Button variant="secondary" onClick={onToggle} loading={statusLoading} className="flex-1 sm:flex-none">
            {!statusLoading && <Power className="h-4 w-4" aria-hidden />}
            {image.is_active ? 'Disable' : 'Enable'}
          </Button>
          <Button variant="ghost" onClick={onDelete} className="text-red-700 hover:bg-red-50" aria-label={`Delete ${name}`}>
            <Trash2 className="h-4 w-4" aria-hidden /><span>Delete</span>
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-paper-line pt-3">
          <span className="text-xs text-ink-mute">Position on homepage</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={isFirst || reorderDisabled}
              aria-label={`Move ${name} earlier`}
              className="flex min-h-[40px] items-center gap-1 rounded-lg px-3 text-xs font-medium text-ink-soft hover:bg-stone-100 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />Earlier
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={isLast || reorderDisabled}
              aria-label={`Move ${name} later`}
              className="flex min-h-[40px] items-center gap-1 rounded-lg px-3 text-xs font-medium text-ink-soft hover:bg-stone-100 disabled:opacity-40"
            >
              Later<ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
