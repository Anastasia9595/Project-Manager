import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

/** Erfolgsmeldung als Dialog; `children` (z.B. eine Liste) erscheint unter dem Text. */
export function SuccessDialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  closeLabel: string
  children?: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent closeLabel={closeLabel} className="text-center">
        <div className="mx-auto flex size-18 items-center justify-center rounded-2xl bg-green-50 text-green-500">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-10" />
        </div>
        <DialogTitle className="mt-6">{title}</DialogTitle>
        <DialogDescription className="mt-3">{description}</DialogDescription>
        {children}
        <DialogClose
          render={<Button variant="outline" size="lg" className="mt-6" />}
        >
          {closeLabel}
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
