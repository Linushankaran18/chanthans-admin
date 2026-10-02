import { ArrowLeft, ArrowRight, Pencil, Power, Trash2 } from 'lucide-react'
import { ActiveBadge } from '../ui/Badge'
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

const moveBtn =
  'flex min-h-[40px] items-center gap-1 rounded-full px-3 text-xs font-medium text-ink-soft transition-colors duration-300 hover:bg-cream-deep hover:text-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-soft'

export function HeroImageCard({ image, isFirst, isLast, statusLoading, reorderDisabled, onEdit, onToggle, onDelete, onMove }: Props) {
  const name = image.title || 'Untitled image'
  return (
    <li className={`group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-500 ease-lux hover:-translate-y-1 hover:shadow-lift ${image.is_active ? '' : 'bg-cream'}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-cream-deep">
        <img
          src={image.image_url}
          alt={image.alt_text || image.title || 'Hero image'}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.03] ${image.is_active ? '' : 'opacity-60 grayscale'}`}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/25 to-transparent" aria-hidden />
        <div className="absolute left-3 top-3"><ActiveBadge active={image.is_active} /></div>
        <div className="absolute right-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur">
          Order {image.display_order}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-2xl font-normal leading-tight">{name}</h3>
          {image.subtitle ? <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{image.subtitle}</p> : <p className="mt-1 text-sm italic text-ink-mute">No subtitle</p>}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onEdit} className="flex-1 sm:flex-none"><Pencil className="h-4 w-4" aria-hidden />Edit</Button>
          <Button variant="secondary" onClick={onToggle} loading={statusLoading} className="flex-1 sm:flex-none">
            {!statusLoading && <Power className="h-4 w-4" aria-hidden />}
            {image.is_active ? 'Disable' : 'Enable'}
          </Button>
          <Button variant="ghost" onClick={onDelete} className="!text-danger hover:!bg-danger-soft" aria-label={`Delete ${name}`}>
            <Trash2 className="h-4 w-4" aria-hidden /><span>Delete</span>
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-[0.68rem] uppercase tracking-[0.2em] text-ink-mute">Position on homepage</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => onMove(-1)} disabled={isFirst || reorderDisabled} aria-label={`Move ${name} earlier`} className={moveBtn}>
              <ArrowLeft className="h-4 w-4" aria-hidden />Earlier
            </button>
            <button type="button" onClick={() => onMove(1)} disabled={isLast || reorderDisabled} aria-label={`Move ${name} later`} className={moveBtn}>
              Later<ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
