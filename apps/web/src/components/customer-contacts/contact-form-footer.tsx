import { Button } from "@workspace/ui/components/button"
import { DialogClose } from "@workspace/ui/components/dialog"

import {
  getSubmitErrorMessage,
  type ContactFormTexts,
} from "@/lib/customer-contact-form/messages"

/** Fußzeile des Dialogs: Fehlermeldung zum Speichern, Abbrechen und Anlegen. */
export function ContactFormFooter({
  t,
  saving,
  submitError,
}: {
  t: ContactFormTexts
  saving: boolean
  /** Fehlercode der API nach einem fehlgeschlagenen Speichern. */
  submitError: string | null
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-8 py-4">
      {submitError && (
        <p role="alert" className="mr-auto text-sm text-destructive">
          {getSubmitErrorMessage(submitError, t)}
        </p>
      )}
      <DialogClose
        render={
          <Button type="button" variant="outline" size="lg" disabled={saving} />
        }
      >
        {t.cancel}
      </DialogClose>
      <Button
        type="submit"
        size="lg"
        disabled={saving}
        className="bg-primary text-white hover:bg-primary/90"
      >
        {saving ? t.saving : t.save}
      </Button>
    </div>
  )
}
