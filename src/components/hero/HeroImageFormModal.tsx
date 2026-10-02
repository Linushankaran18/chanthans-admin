import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
import { Toggle } from '../ui/Toggle'
import { Alert } from '../ui/Alert'
import { heroSchema, type HeroFormValues } from './heroSchema'
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from '../../utils/image'
import type { HeroImage } from '../../types/heroImage'

interface Props {
  /** When provided, the modal edits this image; otherwise it adds a new one. */
  image?: HeroImage
  defaultOrder: number
  submitting: boolean
  progress: number | null
  errorMessage: string | null
  onClose: () => void
  onSubmit: (values: HeroFormValues, file: File | null) => void
}

export function HeroImageFormModal({ image, defaultOrder, submitting, progress, errorMessage, onClose, onSubmit }: Props) {
  const isEdit = !!image
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      title: image?.title ?? '',
      subtitle: image?.subtitle ?? '',
      alt_text: image?.alt_text ?? '',
      display_order: image?.display_order ?? defaultOrder,
      is_active: image?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function onPick(f: File | undefined) {
    if (!f) return
    const err = validateImageFile(f)
    setFileError(err)
    setFile(err ? null : f)
  }

  function submit(values: HeroFormValues) {
    if (!isEdit && !file) { setFileError('Please choose an image to upload.'); return }
    onSubmit(values, file)
  }

  const shownPreview = preview ?? image?.image_url ?? null
  const formId = 'hero-image-form'

  return (
    <Modal
      title={isEdit ? 'Edit Hero Image' : 'Add Hero Image'}
      description={isEdit ? 'Update the details for this image.' : 'Upload an image for the website homepage.'}
      onClose={onClose}
      busy={submitting}
      size="lg"
    >
      <form id={formId} onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
        {errorMessage && <Alert>{errorMessage}</Alert>}

        {!isEdit && (
          <div>
            <label htmlFor="hero-image-file" className="mb-1.5 block text-sm font-medium">Image</label>
            <input
              ref={fileInput}
              id="hero-image-file"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="sr-only"
              disabled={submitting}
              aria-describedby="hero-image-hint hero-image-error"
              onChange={(e) => onPick(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={submitting}
              onClick={() => fileInput.current?.click()}
              className="group relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-ink-soft hover:border-stone-500 disabled:opacity-70"
            >
              {shownPreview ? (
                <img src={shownPreview} alt="Selected image preview" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 px-4 text-sm">
                  <ImagePlus className="h-8 w-8" aria-hidden />
                  Choose an image
                </span>
              )}
            </button>
            {file && (
              <p className="mt-1.5 truncate text-xs text-ink-mute">
                {file.name} ·{' '}
                <button type="button" className="underline" onClick={() => fileInput.current?.click()} disabled={submitting}>Change</button>
              </p>
            )}
            <p id="hero-image-hint" className="mt-1.5 text-xs text-ink-mute">
              Recommended: landscape image, at least 1920px wide. JPEG, PNG or WebP, up to 10 MB.
            </p>
            <p id="hero-image-error" role="alert" className="mt-1.5 text-sm text-red-700">{fileError}</p>
          </div>
        )}

        {isEdit && shownPreview && (
          <img src={shownPreview} alt={image?.alt_text || image?.title || 'Hero image'} className="aspect-[16/9] w-full rounded-xl object-cover" />
        )}

        <TextField label="Title" placeholder="e.g. Capturing your best moments" error={errors.title?.message} {...register('title')} />
        <TextField label="Subtitle" placeholder="A short line shown under the title" error={errors.subtitle?.message} {...register('subtitle')} />
        <TextField
          label="Alt text"
          hint="Describes the image for visitors who cannot see it. Leave blank to use the title."
          error={errors.alt_text?.message}
          {...register('alt_text')}
        />
        <TextField
          label="Display order"
          type="number"
          inputMode="numeric"
          min={1}
          hint="1 appears first."
          error={errors.display_order?.message}
          {...register('display_order', { valueAsNumber: true })}
        />
        <Toggle label="Active" description="Show this image on the website." {...register('is_active')} />

        {submitting && progress !== null && !isEdit && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div className="h-full bg-stone-900 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-ink-mute">{progress < 100 ? `Uploading… ${progress}%` : 'Finishing up…'}</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? (submitting ? 'Saving…' : 'Save Changes') : submitting ? 'Uploading…' : 'Upload Image'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
