import { useCallback, useState } from 'react'
import { fetchInvoicePdf } from '../api/invoices'
import { useToast } from '../contexts/ToastContext'
import { openBlob, saveBlob } from '../utils/download'
import { pdfFailedMessage } from '../utils/errors'

/** Authenticated PDF download / preview for one invoice. */
export function useInvoicePdf(invoice: { id: string; invoice_number: string } | undefined) {
  const toast = useToast()
  const [busy, setBusy] = useState<'download' | 'preview' | null>(null)

  const run = useCallback(
    async (kind: 'download' | 'preview') => {
      if (!invoice) return
      setBusy(kind)
      try {
        const pdf = await fetchInvoicePdf(invoice.id, kind === 'download' ? 'attachment' : 'inline', invoice.invoice_number)
        if (kind === 'download') {
          saveBlob(pdf.blob, pdf.filename)
          toast.success('Invoice PDF downloaded.')
        } else if (!openBlob(pdf.blob)) {
          toast.error('Your browser blocked the preview. Allow pop-ups for this site, or download the PDF instead.')
        }
      } catch (e) {
        toast.error(pdfFailedMessage(e))
      } finally {
        setBusy(null)
      }
    },
    [invoice, toast],
  )

  return { download: () => run('download'), preview: () => run('preview'), busy }
}
