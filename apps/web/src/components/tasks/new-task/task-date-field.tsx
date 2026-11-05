import { FormField } from "@/components/settings/form-field"
import { DatePicker } from "@/components/shared/date-picker"
import type { NewTaskFormState } from "@/hooks/use-new-task-form"
import { getFieldMessage, type TaskFormTexts } from "./form-helpers"

/** Pflichtfeld "Fälligkeit" mit Kalender-Auswahl, Label und Fehlermeldung. */
export function TaskDateField({
  form,
  t,
}: {
  form: NewTaskFormState
  t: TaskFormTexts
}) {
  const code = form.errors.dueDate

  return (
    <FormField
      label={t.dueDate}
      required
      error={getFieldMessage(code, "dueDate", t.validation)}
    >
      {(id, aria) => (
        <DatePicker
          id={id}
          aria={aria}
          value={form.values.dueDate}
          invalid={!!code}
          placeholder={t.placeholders.dueDate}
          locale={t.calendarLocale}
          onChange={(next) => form.setField("dueDate", next)}
        />
      )}
    </FormField>
  )
}
