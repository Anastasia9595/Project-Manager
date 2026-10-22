import type { Dictionary } from "@/i18n"
import type { ContactValidationCode } from "@/lib/customer-contact-form/validation"

export type ContactFormTexts = Dictionary["customerContactsPage"]["form"]
type ValidationTexts = ContactFormTexts["validation"]
type RequiredField = keyof ValidationTexts["required"]

function isRequiredField(
  key: string,
  validation: ValidationTexts
): key is RequiredField {
  return key in validation.required
}

/** Meldung zu einem Validierungsfehler eines Feldes; `undefined`, wenn es keinen Fehler gibt. */
export function getFieldMessage(
  code: ContactValidationCode | undefined,
  field: string,
  validation: ValidationTexts
): string | undefined {
  switch (code) {
    case "invalidEmail":
      return validation.invalidEmail
    case "invalidPhone":
      return validation.invalidPhone
    case "tooLong":
      return validation.tooLong
    case "required":
      return isRequiredField(field, validation)
        ? validation.required[field]
        : undefined
    default:
      return undefined
  }
}

/** Meldung zum Fehlercode der API nach einem fehlgeschlagenen Speichern. */
export function getSubmitErrorMessage(
  code: string,
  t: ContactFormTexts
): string {
  switch (code) {
    case "unauthorized":
      return t.sessionExpired
    case "forbidden":
      return t.forbidden
    case "invalid_location":
      return t.invalidLocation
    default:
      return t.saveError
  }
}
