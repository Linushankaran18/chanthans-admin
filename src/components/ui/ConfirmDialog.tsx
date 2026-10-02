import { Modal } from './Modal'
import { Button } from './Button'

interface Props {
  title: string
  description: string
  cancelLabel?: string
  confirmLabel: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ title, description, cancelLabel = 'Cancel', confirmLabel, loading, onCancel, onConfirm }: Props) {
  return (
    <Modal title={title} description={description} onClose={onCancel} busy={loading} role="alertdialog">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={loading} data-autofocus>{cancelLabel}</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
