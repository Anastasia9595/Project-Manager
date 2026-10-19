import { Button } from "@workspace/ui/components/button"

import type { FormLabels } from "@/components/time-tracking/booking-form/form-layout"
import { fillTemplate } from "@/utils/fill-template"

/** Brand Orange mit weißer Schrift. */
const SUBMIT_BUTTON_CLASS = "flex-1 text-primary-foreground-inverse"

/**
 * Neu: „3:00 h buchen“ + „Zurücksetzen“.
 * Bearbeiten: „Änderungen speichern“ + „Eintrag löschen“ + „Abbrechen“.
 */
export function FormActions({
  isEditing,
  durationLabel,
  disabled,
  onDelete,
  onReset,
  labels,
}: {
  isEditing: boolean
  durationLabel: string
  disabled: boolean
  onDelete: () => void
  onReset: () => void
  labels: FormLabels
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="submit" className={SUBMIT_BUTTON_CLASS} disabled={disabled}>
        {isEditing ? labels.save : fillTemplate(labels.submit, { duration: durationLabel })}
      </Button>
      {isEditing && (
        <Button
          type="button"
          variant="destructive"
          className="flex-1"
          disabled={disabled}
          onClick={onDelete}
        >
          {labels.delete}
        </Button>
      )}
      <Button type="button" variant="outline" className="flex-1" onClick={onReset}>
        {isEditing ? labels.cancel : labels.reset}
      </Button>
    </div>
  )
}
