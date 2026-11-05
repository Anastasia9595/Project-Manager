import { FormField } from "@/components/settings/form-field"
import { SettingsInput } from "@/components/settings/settings-input"
import type { NewTaskFormState } from "@/hooks/use-new-task-form"
import { getFieldMessage, type TaskFormTexts } from "./form-helpers"

/** Einzeiliges Eingabefeld (Titel oder Datum) mit Label und Fehlermeldung. */
export function TaskTextField({
  form,
  t,
  name,
  label,
  placeholder,
  type,
  maxLength,
  required,
  autoFocus,
  className,
}: {
  form: NewTaskFormState
  t: TaskFormTexts
  name: "name" | "dueDate"
  label: string
  placeholder?: string
  type?: "date"
  maxLength?: number
  required?: boolean
  autoFocus?: boolean
  className?: string
}) {
  const code = form.errors[name]

  return (
    <FormField
      label={label}
      required={required}
      error={getFieldMessage(code, name, t.validation)}
      className={className}
    >
      {(id, aria) => (
        <SettingsInput
          id={id}
          type={type}
          autoFocus={autoFocus}
          autoComplete="off"
          maxLength={maxLength}
          placeholder={placeholder}
          value={form.values[name]}
          aria-invalid={code ? true : undefined}
          {...aria}
          onChange={(event) => form.setField(name, event.target.value)}
        />
      )}
    </FormField>
  )
}
