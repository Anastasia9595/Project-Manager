import { FormField } from "@/components/settings/form-field"
import { SettingsInput } from "@/components/settings/settings-input"
import type { NewProjectFormState } from "@/hooks/use-new-project-form"
import type { NewProjectValues } from "@/services/projects/new-project.values"
import { getFieldMessage, type ProjectFormTexts } from "./form-helpers"

type TextFieldName = Exclude<
  keyof NewProjectValues,
  | "tenantId"
  | "tenantUserId"
  | "mediaTypeId"
  | "variantId"
  | "printingCompanyId"
  | "deliveryType"
>

/** Einzeiliges Eingabefeld (Text, Zahl oder Datum) mit Label und Fehlermeldung. */
export function ProjectTextField({
  form,
  t,
  name,
  label,
  placeholder,
  type,
  inputMode,
  min,
  maxLength,
  required,
  autoFocus,
  className,
}: {
  form: NewProjectFormState
  t: ProjectFormTexts
  name: TextFieldName
  label: string
  placeholder?: string
  type?: "date"
  inputMode?: "numeric"
  min?: string
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
          inputMode={inputMode}
          min={min}
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
