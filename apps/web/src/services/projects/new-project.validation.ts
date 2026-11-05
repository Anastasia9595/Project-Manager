import { isDate } from "@/services/time-entries/time-entries.mapper"
import { isUuid } from "@/utils/is-uuid"
import { isDeliveryType, type NewProjectValues } from "./new-project.values"

/** Höchstlängen je Feld; das Formular nutzt sie als maxLength, der Server prüft sie erneut. */
export const MAX_LENGTH = {
  name: 200,
  description: 2000,
  internalNotes: 2000,
} as const

export const MAX_CIRCULATION = 10_000_000
export const MAX_BUFFER_DAYS = 365

export type ProjectValidationCode =
  "required" | "invalid" | "tooLong" | "pastDate"

export type ProjectValidationErrors = Partial<
  Record<keyof NewProjectValues, ProjectValidationCode>
>

const INTEGER = /^\d+$/
// Integer-IDs höchstens 9 Stellen, damit sie sicher in ein Postgres-integer passen.
const INTEGER_ID = /^\d{1,9}$/

/** Wird im Browser und in der API-Route genutzt. Längen werden am Rohwert gemessen (wie maxLength). */
export function validateNewProject(
  values: NewProjectValues,
  today: string
): ProjectValidationErrors {
  const errors: ProjectValidationErrors = {}

  if (!values.name.trim()) errors.name = "required"
  else if (values.name.length > MAX_LENGTH.name) errors.name = "tooLong"

  for (const key of ["tenantId", "mediaTypeId", "variantId"] as const) {
    if (!values[key]) errors[key] = "required"
    else if (!isUuid(values[key])) errors[key] = "invalid"
  }

  if (!values.printingCompanyId) errors.printingCompanyId = "required"
  else if (!INTEGER_ID.test(values.printingCompanyId)) {
    errors.printingCompanyId = "invalid"
  }

  if (values.tenantUserId && !INTEGER_ID.test(values.tenantUserId)) {
    errors.tenantUserId = "invalid"
  }

  if (!values.circulation) errors.circulation = "required"
  else if (
    !INTEGER.test(values.circulation) ||
    Number(values.circulation) < 1 ||
    Number(values.circulation) > MAX_CIRCULATION
  ) {
    errors.circulation = "invalid"
  }

  if (!values.palDate) errors.palDate = "required"
  else if (!isDate(values.palDate)) errors.palDate = "invalid"
  else if (values.palDate < today) errors.palDate = "pastDate"

  if (
    values.bufferDays &&
    (!INTEGER.test(values.bufferDays) ||
      Number(values.bufferDays) > MAX_BUFFER_DAYS)
  ) {
    errors.bufferDays = "invalid"
  }

  for (const key of [
    "deliveryDate",
    "distributionDate",
    "validUntil",
  ] as const) {
    if (values[key] && !isDate(values[key])) errors[key] = "invalid"
  }

  if (values.deliveryType && !isDeliveryType(values.deliveryType)) {
    errors.deliveryType = "invalid"
  }

  for (const key of ["description", "internalNotes"] as const) {
    if (values[key].length > MAX_LENGTH[key]) errors[key] = "tooLong"
  }

  return errors
}
