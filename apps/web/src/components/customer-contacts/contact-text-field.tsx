import { FormField } from "@/components/settings/form-field"
import { SettingsInput } from "@/components/settings/settings-input"
import type { CustomerContactFormState } from "@/hooks/use-customer-contact-form"
import {
  getFieldMessage,
  type ContactFormTexts,
} from "@/lib/customer-contact-form/messages"

type TextFieldName = "firstName" | "lastName" | "email" | "phone" | "mobile"

/** Einzeiliges Textfeld des Kontaktformulars mit Label, Platzhalter und Fehlermeldung. */
export function ContactTextField({
  form,
  t,
  name,
  label,
  maxLength,
  type,
  required,
  autoFocus,
  className,
}: {
  form: CustomerContactFormState
  t: ContactFormTexts
  name: TextFieldName
  label: string
  maxLength: number
  type?: "email" | "tel"
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
          placeholder={t.placeholders[name]}
          value={form.values[name]}
          aria-invalid={code ? true : undefined}
          {...aria}
          onChange={(event) => form.setField(name, event.target.value)}
        />
      )}
    </FormField>
  )
}
