import { FormField } from "@/components/settings/form-field"
import { SettingsInput } from "@/components/settings/settings-input"
import type { NewTaskFormState } from "@/hooks/use-new-task-form"
import { getFieldMessage, type TaskFormTexts } from "./form-helpers"

/** Einzeiliges Eingabefeld (Titel) mit Label und Fehlermeldung. */
export function TaskTextField({
  form,
  t,
  name,
  label,
  placeholder,
  maxLength,
  required,
  autoFocus,
  className,
}: {
  form: NewTaskFormState
  t: TaskFormTexts
  name: "name"
  label: string
  placeholder?: string
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
