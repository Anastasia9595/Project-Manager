import { FormField } from "@/components/settings/form-field"
import { DatePicker } from "@/components/shared/date-picker"
import type { NewProjectFormState } from "@/hooks/use-new-project-form"
import { getFieldMessage, type ProjectFormTexts } from "./form-helpers"

/** Datumsfeld des Projektformulars (Kalender-Auswahl) mit Label und Fehlermeldung. */
export function ProjectDateField({
  form,
  t,
  name,
  label,
  minDate,
  required,
}: {
  form: NewProjectFormState
  t: ProjectFormTexts
  name: "palDate" | "deliveryDate" | "distributionDate" | "validUntil"
  label: string
  minDate?: string
  required?: boolean
}) {
  const code = form.errors[name]

  return (
    <FormField
      label={label}
      required={required}
      error={getFieldMessage(code, name, t.validation)}
    >
      {(id, aria) => (
        <DatePicker
          id={id}
          aria={aria}
          value={form.values[name]}
          invalid={!!code}
          placeholder={t.placeholders.date}
          clearLabel={required ? undefined : t.clearDate}
          minDate={minDate}
          locale={t.calendarLocale}
          onChange={(next) => form.setField(name, next)}
        />
      )}
    </FormField>
  )
}
