// Formularwerte "Neues Projekt" (Collection projects, Typ printing_lines).

export const DELIVERY_TYPES = ["pal", "delivery"] as const

export type DeliveryType = (typeof DELIVERY_TYPES)[number]

export type NewProjectValues = {
  name: string
  /** UUID des Kunden (tenants). */
  tenantId: string
  /** Leer oder Integer-String. */
  tenantUserId: string
  /** UUID. */
  mediaTypeId: string
  /** UUID. */
  variantId: string
  /** Integer-String. */
  printingCompanyId: string
  /** Integer-String. */
  circulation: string
  /** YYYY-MM-DD */
  palDate: string
  /** Leer oder Integer-String. */
  bufferDays: string
  deliveryType: "" | DeliveryType
  /** Leer oder YYYY-MM-DD. */
  deliveryDate: string
  /** Leer oder YYYY-MM-DD. */
  distributionDate: string
  /** Leer oder YYYY-MM-DD. */
  validUntil: string
  description: string
  internalNotes: string
}

export const EMPTY_NEW_PROJECT_VALUES: NewProjectValues = {
  name: "",
  tenantId: "",
  tenantUserId: "",
  mediaTypeId: "",
  variantId: "",
  printingCompanyId: "",
  circulation: "",
  palDate: "",
  bufferDays: "",
  deliveryType: "",
  deliveryDate: "",
  distributionDate: "",
  validUntil: "",
  description: "",
  internalNotes: "",
}

export function isDeliveryType(value: unknown): value is DeliveryType {
  return (
    typeof value === "string" &&
    (DELIVERY_TYPES as readonly string[]).includes(value)
  )
}

export function isNewProjectValues(body: unknown): body is NewProjectValues {
  if (typeof body !== "object" || body === null) return false
  const record = body as Record<string, unknown>
  return (
    Object.keys(EMPTY_NEW_PROJECT_VALUES).every(
      (key) => typeof record[key] === "string"
    ) &&
    (record.deliveryType === "" || isDeliveryType(record.deliveryType))
  )
}
