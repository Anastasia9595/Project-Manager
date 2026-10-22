import type { CustomerContactValues } from "@/lib/customer-contact-form/fields"
import { isValidEmail } from "@/utils/validators"

export type ContactValidationCode = "required" | "invalidEmail"

export type ContactValidationErrors = Partial<
  Record<"firstName" | "lastName" | "tenantId" | "email", ContactValidationCode>
>

/** Wird im Browser und in der API-Route genutzt. */
export function validateCustomerContact(
  values: CustomerContactValues
): ContactValidationErrors {
  const errors: ContactValidationErrors = {}

  if (!values.firstName.trim()) errors.firstName = "required"
  if (!values.lastName.trim()) errors.lastName = "required"
  if (!values.tenantId) errors.tenantId = "required"
  if (values.email.trim() && !isValidEmail(values.email)) {
    errors.email = "invalidEmail"
  }

  return errors
}
