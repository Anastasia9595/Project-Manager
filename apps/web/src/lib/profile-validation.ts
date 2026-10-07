import type { ProfileValues } from "@/models/profile"
import { isValidEmail, isValidPhone } from "@/utils/validators"

export const MIN_PASSWORD_LENGTH = 8
export const ABOUT_MAX_LENGTH = 300

export type ValidationCode =
  | "required"
  | "invalidEmail"
  | "invalidPhone"
  | "aboutTooLong"
  | "passwordTooShort"
  | "passwordMismatch"

export type ValidationErrors<K extends string> = Partial<
  Record<K, ValidationCode>
>

/** Wird im Browser und in der API-Route genutzt. */
export function validateProfile(
  values: ProfileValues
): ValidationErrors<keyof ProfileValues> {
  const errors: ValidationErrors<keyof ProfileValues> = {}

  if (!values.firstName.trim()) errors.firstName = "required"
  if (!values.lastName.trim()) errors.lastName = "required"
  if (!values.email.trim()) errors.email = "required"
  else if (!isValidEmail(values.email)) errors.email = "invalidEmail"
  if (values.about.length > ABOUT_MAX_LENGTH) errors.about = "aboutTooLong"
  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = "invalidPhone"
  }

  return errors
}

/** `confirm` ist optional, weil die API-Route nur das neue Passwort erhält. */
export function validatePasswordChange({
  next,
  confirm,
}: {
  next: string
  confirm?: string
}): ValidationErrors<"next" | "confirm"> {
  const errors: ValidationErrors<"next" | "confirm"> = {}

  if (next.length < MIN_PASSWORD_LENGTH) errors.next = "passwordTooShort"
  if (confirm !== undefined && next !== confirm) {
    errors.confirm = "passwordMismatch"
  }

  return errors
}

/** Ersetzt die Fehlercodes durch die übersetzten Meldungen. */
export function toErrorMessages<K extends string>(
  errors: ValidationErrors<K>,
  messages: Record<ValidationCode, string>
): Partial<Record<K, string>> {
  return Object.fromEntries(
    Object.entries(errors).map(([key, code]) => [
      key,
      messages[code as ValidationCode],
    ])
  ) as Partial<Record<K, string>>
}
