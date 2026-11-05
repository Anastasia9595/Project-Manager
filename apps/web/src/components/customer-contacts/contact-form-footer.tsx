import { FormDialogFooter } from "@/components/shared/form-dialog-footer"
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
    <FormDialogFooter
      saving={saving}
      errorMessage={submitError && getSubmitErrorMessage(submitError, t)}
      texts={t}
    />
  )
}
