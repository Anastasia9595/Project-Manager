import { FormSelect } from "@/components/customer-contacts/form-select"
import { FormField } from "@/components/settings/form-field"
import type { NewProjectFormState } from "@/hooks/use-new-project-form"
import type { SelectOption } from "@/lib/customer-contact-form/options"
import type { NewProjectValues } from "@/services/projects/new-project.values"
import { getFieldMessage, type ProjectFormTexts } from "./form-helpers"

/** Auswahlfeld des Projektformulars mit Label und Fehlermeldung. */
export function ProjectSelectField({
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
}: {
  form: NewProjectFormState
  t: ProjectFormTexts
  name: keyof NewProjectValues
  label: string
  options: SelectOption[]
  placeholder: string
  onValueChange: (value: string) => void
  emptyLabel?: string
  disabled?: boolean
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
