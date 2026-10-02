import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  sortHeroImages,
  useCreateHeroImage,
  useDeleteHeroImage,
  useHeroImages,
  useReorderHeroImages,
  useSetHeroImageStatus,
  useUpdateHeroImage,
} from '../hooks/useHeroImages'
import { useToast } from '../contexts/ToastContext'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HeroImageCard } from '../components/hero/HeroImageCard'
import { HeroImageSkeleton } from '../components/hero/HeroImageSkeleton'
import { HeroEmptyState } from '../components/hero/HeroEmptyState'
import { HeroImageFormModal } from '../components/hero/HeroImageFormModal'
import type { HeroFormValues } from '../components/hero/heroSchema'
import type { HeroImage } from '../types/heroImage'
import { genericErrorMessage, loadErrorMessage, uploadErrorMessage } from '../utils/errors'

type ModalState = { type: 'add' } | { type: 'edit'; image: HeroImage } | { type: 'delete'; image: HeroImage } | null

export default function HeroImagesPage() {
  const toast = useToast()
  const { data, isLoading, isError, error, refetch, isRefetching } = useHeroImages()
  const create = useCreateHeroImage()
  const update = useUpdateHeroImage()
  const setStatus = useSetHeroImageStatus()
  const remove = useDeleteHeroImage()
  const reorder = useReorderHeroImages()

  const [modal, setModal] = useState<ModalState>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingStatusId, setPendingStatusId] = useState<HeroImage['id'] | null>(null)

  const images = data ?? []
  const nextOrder = images.reduce((max, h) => Math.max(max, h.display_order), 0) + 1

  function closeModal() {
    setModal(null)
    setFormError(null)
    setProgress(null)
  }

  function handleSubmit(values: HeroFormValues, file: File | null) {
    if (create.isPending || update.isPending) return
    setFormError(null)
    if (modal?.type === 'edit') {
      update.mutate(
        { id: modal.image.id, values },
        {
          onSuccess: () => { closeModal(); toast.success('Hero image updated.') },
          onError: (e) => setFormError(genericErrorMessage(e, 'save your changes')),
        },
      )
    } else if (file) {
      setProgress(0)
      create.mutate(
        { values: { ...values, image: file }, onProgress: setProgress },
        {
          onSuccess: () => { closeModal(); toast.success('Hero image uploaded successfully.') },
          onError: (e) => { setProgress(null); setFormError(uploadErrorMessage(e)) },
        },
      )
    }
  }

  function handleToggle(image: HeroImage) {
    const next = !image.is_active
    setPendingStatusId(image.id)
    setStatus.mutate(
      { id: image.id, is_active: next },
      {
        onSuccess: () => toast.success(next ? 'Hero image enabled.' : 'Hero image disabled.'),
        onError: (e) => toast.error(genericErrorMessage(e, next ? 'enable this image' : 'disable this image')),
        onSettled: () => setPendingStatusId(null),
      },
    )
  }

  function handleDelete(image: HeroImage) {
    remove.mutate(image.id, {
      onSuccess: () => { closeModal(); toast.success('Hero image deleted.') },
      onError: (e) => { closeModal(); toast.error(genericErrorMessage(e, 'delete this image')) },
    })
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = sortHeroImages(images)
    ;[next[index], next[target]] = [next[target], next[index]]
    reorder.mutate(next, {
      onError: (e) => toast.error(genericErrorMessage(e, 'change the order')),
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Hero Images</h1>
          <p className="mt-2 text-ink-soft">Manage the images displayed on the website homepage.</p>
        </div>
        <Button onClick={() => setModal({ type: 'add' })} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden />
          Add Hero Image
        </Button>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <HeroImageSkeleton />
        ) : isError ? (
          <ErrorState message={loadErrorMessage(error)} onRetry={() => refetch()} retrying={isRefetching} />
        ) : images.length === 0 ? (
          <HeroEmptyState onAdd={() => setModal({ type: 'add' })} />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image, i) => (
              <HeroImageCard
                key={image.id}
                image={image}
                isFirst={i === 0}
                isLast={i === images.length - 1}
                statusLoading={pendingStatusId === image.id}
                reorderDisabled={reorder.isPending}
                onEdit={() => setModal({ type: 'edit', image })}
                onToggle={() => handleToggle(image)}
                onDelete={() => setModal({ type: 'delete', image })}
                onMove={(d) => handleMove(i, d)}
              />
            ))}
          </ul>
        )}
      </div>

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <HeroImageFormModal
          image={modal.type === 'edit' ? modal.image : undefined}
          defaultOrder={nextOrder}
          submitting={create.isPending || update.isPending}
          progress={progress}
          errorMessage={formError}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {modal?.type === 'delete' && (
        <ConfirmDialog
          title="Delete this hero image?"
          description="This image will be removed from the website and cannot be restored."
          confirmLabel="Delete Image"
          loading={remove.isPending}
          onCancel={closeModal}
          onConfirm={() => handleDelete(modal.image)}
        />
      )}
    </div>
  )
}
