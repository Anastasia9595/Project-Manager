import { POSITIONS, type Position } from "@/lib/customer-contact-form/fields"
import type { ContactFormTexts } from "@/lib/customer-contact-form/messages"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"

export type SelectOption = { value: string; label: string }

export function toTenantOptions(options: ContactOptions): SelectOption[] {
  return options.tenants.map((tenant) => ({
    value: tenant.id,
    label: tenant.name,
  }))
}

/** Nur die Standorte des gewählten Kunden. */
export function toLocationOptions(
  options: ContactOptions,
  tenantId: string
): SelectOption[] {
  return options.locations
    .filter((location) => location.tenant === tenantId)
    .map((location) => ({ value: location.id, label: location.name }))
}

export function toPositionOptions(
  labels: Record<Position, string>
): SelectOption[] {
  return POSITIONS.map((position) => ({
    value: position,
    label: labels[position],
  }))
}

/** Platzhalter des Standort-Felds: sagt, was noch fehlt oder warum es leer ist. */
export function getLocationPlaceholder(
  tenantId: string,
  locationCount: number,
  placeholders: ContactFormTexts["placeholders"]
): string {
  if (!tenantId) return placeholders.locationNeedsTenant
  if (locationCount === 0) return placeholders.locationNone
  return placeholders.location
}
