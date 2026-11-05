import type { NewProjectValues } from "./new-project.values"

export type ProjectOptions = {
  tenants: { id: string; name: string }[]
  tenantUsers: { id: string; name: string; tenant: string | null }[]
  mediaTypes: { id: string; name: string }[]
  variants: { id: string; name: string; mediaType: string | null }[]
  printingCompanies: { id: string; name: string }[]
}

/** Rohzeilen der Dropdown-Collections (Directus-Feldnamen). */
export type ProjectOptionRows = {
  tenants: { id: string; tenant_name: string | null }[]
  tenantUsers: {
    id: number
    first_name: string | null
    last_name: string | null
    tenant: string | null
  }[]
  mediaTypes: { id: string; name: string | null }[]
  variants: { id: string; name: string | null; product: string | null }[]
  printingCompanies: {
    id: number
    company_name: string | null
    company_suffix: string | null
  }[]
}

/** Vom Server nachgeschlagene Werte, die in die Payloads und die Validierung einfließen. */
export type ProjectLookup = {
  tenantName: string
  mediaTypeCategory: string | null
  variantMediaType: string | null
  contactTenant: string | null
}

export type SubmissionInput = {
  values: NewProjectValues
  userId: string
  lookup: ProjectLookup
  today: string
}

export type LineInput = SubmissionInput & {
  submissionId: string
  projectNumber: string
}
