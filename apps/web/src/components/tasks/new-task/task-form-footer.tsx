import { FormDialogFooter } from "@/components/shared/form-dialog-footer"

import { getSubmitErrorMessage, type TaskFormTexts } from "./form-helpers"

/** Fußzeile des Dialogs: Fehlermeldung zum Speichern, Abbrechen und Anlegen (wie beim Projektformular). */
export function TaskFormFooter({
  t,
  saving,
  submitError,
}: {
  t: TaskFormTexts
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
