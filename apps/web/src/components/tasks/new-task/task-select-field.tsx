import { FormSelect } from "@/components/customer-contacts/form-select"
import { FormField } from "@/components/settings/form-field"
import type { NewTaskFormState } from "@/hooks/use-new-task-form"
import type { SelectOption } from "@/lib/customer-contact-form/options"
import { getFieldMessage, type TaskFormTexts } from "./form-helpers"

/** Auswahlfeld des Aufgabenformulars mit Label und Fehlermeldung. */
export function TaskSelectField({
  form,
  t,
  name,
  label,
  options,
  placeholder,
  onValueChange,
  emptyLabel,
  disabled,
  required,
  className,
}: {
  form: NewTaskFormState
  t: TaskFormTexts
  name: "templateId" | "projectId" | "priority"
  label: string
  options: SelectOption[]
  placeholder?: string
  onValueChange: (value: string) => void
  emptyLabel?: string
  disabled?: boolean
  required?: boolean
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
        <FormSelect
          id={id}
          aria={aria}
          value={form.values[name]}
          invalid={!!code}
          options={options}
          placeholder={placeholder}
          emptyLabel={emptyLabel}
          disabled={disabled}
          onValueChange={onValueChange}
        />
      )}
    </FormField>
  )
}
