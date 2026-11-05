import { FormDialogFooter } from "@/components/shared/form-dialog-footer"

import { getSubmitErrorMessage, type ProjectFormTexts } from "./form-helpers"

/** Fußzeile des Dialogs: Fehlermeldung zum Speichern, Abbrechen und Anlegen (wie beim Kontaktformular). */
export function ProjectFormFooter({
  t,
  saving,
  submitError,
}: {
  t: ProjectFormTexts
  saving: boolean
  /** Fehlercode der API nach einem fehlgeschlagenen Speichern. */
  submitError: string | null
}) {
  return (
    <FormDialogFooter
      saving={saving}
      errorMessage={submitError && getSubmitErrorMessage(submitError, t.errors)}
      texts={t}
    />
  )
}
