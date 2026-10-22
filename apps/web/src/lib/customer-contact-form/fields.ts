// Zuordnung des Formulars "Neuer Kundenkontakt" zur Directus-Collection tenant_users.

export const POSITIONS = [
  "management",
  "assistenz_von_fr_seifert",
  "assistenz_empfang",
  "buchhaltung",
  "werbeabteilung",
] as const

export const CONTACT_METHODS = ["email", "phone", "mobile"] as const

export type Position = (typeof POSITIONS)[number]
export type ContactMethod = (typeof CONTACT_METHODS)[number]

export type CustomerContactValues = {
  firstName: string
  lastName: string
  /** ID des Kunden (tenants). */
  tenantId: string
  /** ID des Standorts (location); leer, wenn keiner gewählt ist. */
  locationId: string
  position: "" | Position
  isActive: boolean
  email: string
  phone: string
  mobile: string
  preferredContact: "" | ContactMethod
  notes: string
}

export const EMPTY_CUSTOMER_CONTACT_VALUES: CustomerContactValues = {
  firstName: "",
  lastName: "",
  tenantId: "",
  locationId: "",
  position: "",
  isActive: true,
  email: "",
  phone: "",
  mobile: "",
  preferredContact: "",
  notes: "",
}

const STRING_KEYS = [
  "firstName",
  "lastName",
  "tenantId",
  "locationId",
  "position",
  "email",
  "phone",
  "mobile",
  "preferredContact",
  "notes",
] as const

function isOneOf(value: unknown, allowed: readonly string[]): boolean {
  return value === "" || (typeof value === "string" && allowed.includes(value))
}

export function isCustomerContactValues(
  body: unknown
): body is CustomerContactValues {
  if (typeof body !== "object" || body === null) return false
  const record = body as Record<string, unknown>
  return (
    STRING_KEYS.every((key) => typeof record[key] === "string") &&
    typeof record.isActive === "boolean" &&
    isOneOf(record.position, POSITIONS) &&
    isOneOf(record.preferredContact, CONTACT_METHODS)
  )
}

function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export function toDirectusPayload(
  values: CustomerContactValues
): Record<string, unknown> {
  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    tenant: values.tenantId,
    locations: orNull(values.locationId),
    positions: values.position || null,
    is_active: values.isActive,
    email: orNull(values.email),
    phone: orNull(values.phone),
    mobile: orNull(values.mobile),
    preferred_contact: values.preferredContact || null,
    notes: orNull(values.notes),
  }
}
