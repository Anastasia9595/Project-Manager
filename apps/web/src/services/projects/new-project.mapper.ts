import type {
  LineInput,
  ProjectOptionRows,
  ProjectOptions,
  SubmissionInput,
} from "./new-project.types"

const orNull = (value: string) => (value.trim() === "" ? null : value)
const numberOrNull = (value: string) => (value === "" ? null : Number(value))

/** Nächste Projektnummer "P-<Jahr>-NNN" aus den vorhandenen Nummern. */
export function nextProjectNumber(
  existing: (string | null)[],
  year: number
): string {
  const prefix = `P-${year}-`
  const highest = existing.reduce((max, number) => {
    if (!number?.startsWith(prefix)) return max
    const rest = number.slice(prefix.length)
    return /^\d+$/.test(rest) ? Math.max(max, Number(rest)) : max
  }, 0)
  return `${prefix}${String(highest + 1).padStart(3, "0")}`
}

/** Das spätere von PAL-Datum und morgen (Formular-Einreichung darf nicht in der Vergangenheit liegen). */
export function submissionPalDate(palDate: string, today: string): string {
  const next = new Date(`${today}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  const tomorrow = next.toISOString().slice(0, 10)
  return palDate > tomorrow ? palDate : tomorrow
}

export function toSubmissionPayload({
  values,
  userId,
  lookup,
  today,
}: SubmissionInput): Record<string, unknown> {
  return {
    status: "approved",
    customer_company: lookup.tenantName,
    submitted_by: numberOrNull(values.tenantUserId),
    selected_medium: values.mediaTypeId,
    selected_variant: values.variantId,
    medium_category: lookup.mediaTypeCategory,
    circulation: Number(values.circulation),
    assigned_printer: Number(values.printingCompanyId),
    assigned_contact: userId,
    layout_choice: "orange_individual",
    pal_date: submissionPalDate(values.palDate, today),
  }
}

export function toPrintingLinePayload({
  values,
  userId,
  lookup,
  submissionId,
  projectNumber,
}: LineInput): Record<string, unknown> {
  return {
    name: values.name.trim(),
    status: "created",
    project_number: projectNumber,
    project_description: orNull(values.description.trim()),
    internal_notes: orNull(values.internalNotes.trim()),
    tenant: values.tenantId,
    tenant_user: numberOrNull(values.tenantUserId),
    printing_company: Number(values.printingCompanyId),
    media_type: values.mediaTypeId,
    variant: values.variantId,
    category: lookup.mediaTypeCategory,
    assigned_contact: userId,
    delivery_type: values.deliveryType || null,
    circulation: Number(values.circulation),
    buffer_days: numberOrNull(values.bufferDays),
    pal_date: values.palDate,
    delivery_date: orNull(values.deliveryDate),
    distribution_date: orNull(values.distributionDate),
    valid_until: orNull(values.validUntil),
    form_submission: submissionId,
  }
}

export function toProjectOptions(rows: ProjectOptionRows): ProjectOptions {
  return {
    tenants: rows.tenants.map((r) => ({
      id: r.id,
      name: r.tenant_name ?? "",
    })),
    tenantUsers: rows.tenantUsers.map((r) => ({
      id: String(r.id),
      name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
      tenant: r.tenant,
    })),
    mediaTypes: rows.mediaTypes.map((r) => ({ id: r.id, name: r.name ?? "" })),
    variants: rows.variants.map((r) => ({
      id: r.id,
      name: r.name ?? "",
      mediaType: r.product,
    })),
    printingCompanies: rows.printingCompanies.map((r) => ({
      id: String(r.id),
      name: [r.company_name ?? "", r.company_suffix].filter(Boolean).join(" "),
    })),
  }
}
