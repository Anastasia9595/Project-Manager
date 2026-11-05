import type { Dictionary } from "@/i18n"
import type { SelectOption } from "@/lib/customer-contact-form/options"
import type { ProjectOptions } from "@/services/projects/new-project.types"
import type { ProjectValidationCode } from "@/services/projects/new-project.validation"
import type { NewProjectValues } from "@/services/projects/new-project.values"

export type ProjectFormTexts = Dictionary["projectsPage"]["form"]
type ValidationTexts = ProjectFormTexts["validation"]

const DATE_FIELDS: readonly string[] = [
  "palDate",
  "deliveryDate",
  "distributionDate",
  "validUntil",
]

export function toSelectOptions(
  items: { id: string; name: string }[]
): SelectOption[] {
  return items.map((item) => ({ value: item.id, label: item.name }))
}

/** Nur die Kontaktpersonen des gewählten Kunden. */
export function toTenantUserOptions(
  options: ProjectOptions,
  tenantId: string
): SelectOption[] {
  return toSelectOptions(
    options.tenantUsers.filter((user) => user.tenant === tenantId)
  )
}

/** Nur die Varianten des gewählten Medientyps. */
export function toVariantOptions(
  options: ProjectOptions,
  mediaTypeId: string
): SelectOption[] {
  return toSelectOptions(
    options.variants.filter((variant) => variant.mediaType === mediaTypeId)
  )
}

/** Platzhalter eines abhängigen Auswahlfelds: sagt, was noch fehlt oder warum es leer ist. */
export function getDependentPlaceholder(
  parentId: string,
  count: number,
  texts: { needsParent: string; none: string; choose: string }
): string {
  if (!parentId) return texts.needsParent
  if (count === 0) return texts.none
  return texts.choose
}

/** Meldung zu einem Validierungsfehler eines Feldes; `undefined`, wenn es keinen Fehler gibt. */
export function getFieldMessage(
  code: ProjectValidationCode | undefined,
  field: keyof NewProjectValues,
  validation: ValidationTexts
): string | undefined {
  switch (code) {
    case "required":
      return field in validation.required
        ? validation.required[field as keyof ValidationTexts["required"]]
        : undefined
    case "tooLong":
      return validation.tooLong
    case "pastDate":
      return validation.pastDate
    case "invalid":
      if (field === "circulation") return validation.invalidCirculation
      if (field === "bufferDays") return validation.invalidBufferDays
      return DATE_FIELDS.includes(field)
        ? validation.invalidDate
        : validation.invalid
    default:
      return undefined
  }
}

/** Meldung zum Fehlercode der API nach einem fehlgeschlagenen Speichern. */
export function getSubmitErrorMessage(
  code: string,
  errors: ProjectFormTexts["errors"]
): string {
  switch (code) {
    case "unauthorized":
      return errors.sessionExpired
    case "forbidden":
      return errors.forbidden
    case "invalid_variant":
      return errors.invalidVariant
    case "invalid_contact":
      return errors.invalidContact
    default:
      return errors.saveError
  }
}
