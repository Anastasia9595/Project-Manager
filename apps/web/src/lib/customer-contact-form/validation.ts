import type { CustomerContactValues } from "@/lib/customer-contact-form/fields"
import { isValidEmail, isValidPhone } from "@/utils/validators"

/** Höchstlängen je Feld; das Formular nutzt sie als maxLength, der Server prüft sie erneut. */
export const MAX_LENGTH = {
  name: 100,
  email: 254,
  phone: 40,
  notes: 2000,
} as const

export type ContactValidationCode =
  | "required"
  | "invalidEmail"
  | "invalidPhone"
  | "tooLong"

export type ContactValidationErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "tenantId"
    | "email"
    | "phone"
    | "mobile"
    | "notes",
    ContactValidationCode
  >
>

function checkName(value: string): ContactValidationCode | undefined {
  const trimmed = value.trim()
  if (!trimmed) return "required"
  if (trimmed.length > MAX_LENGTH.name) return "tooLong"
}

function checkPhone(value: string): ContactValidationCode | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length > MAX_LENGTH.phone) return "tooLong"
  if (!isValidPhone(trimmed)) return "invalidPhone"
}

/** Wird im Browser und in der API-Route genutzt. */
export function validateCustomerContact(
  values: CustomerContactValues
): ContactValidationErrors {
  const errors: ContactValidationErrors = {}

  const firstName = checkName(values.firstName)
  if (firstName) errors.firstName = firstName
  const lastName = checkName(values.lastName)
  if (lastName) errors.lastName = lastName
  if (!values.tenantId.trim()) errors.tenantId = "required"

  const email = values.email.trim()
  if (email.length > MAX_LENGTH.email) errors.email = "tooLong"
  else if (email && !isValidEmail(email)) errors.email = "invalidEmail"

  const phone = checkPhone(values.phone)
  if (phone) errors.phone = phone
  const mobile = checkPhone(values.mobile)
  if (mobile) errors.mobile = mobile

  if (values.notes.trim().length > MAX_LENGTH.notes) errors.notes = "tooLong"

  return errors
}
