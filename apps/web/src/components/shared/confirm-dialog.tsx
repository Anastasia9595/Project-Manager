import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

/** Rückfrage vor einer Aktion; schließt bei Abbrechen, Escape oder Klick daneben. */
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description: React.ReactNode
  confirmLabel: string
  cancelLabel: string
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent closeLabel={cancelLabel}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-3">{description}</DialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose render={<Button variant="outline" />}>
            {cancelLabel}
          </DialogClose>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
