import { createItem, readItems } from "@directus/sdk"

import { directus } from "@/lib/directus"
import {
  toDirectusPayload,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"

export type ContactOptions = {
  tenants: { id: string; name: string }[]
  locations: { id: string; name: string; tenant: string | null }[]
}

type TenantRow = { id: string; tenant_name: string | null }
type LocationRow = { id: string; name: string | null; tenant: string | null }

/** Legt eine Kontaktperson in tenant_users an (Status bleibt der Directus-Standard "draft"). */
export async function createTenantUser(
  values: CustomerContactValues
): Promise<void> {
  await directus.request(createItem("tenant_users", toDirectusPayload(values)))
}

/** Kunden und Standorte für die Dropdowns des Formulars. */
export async function fetchContactOptions(): Promise<ContactOptions> {
  const [tenants, locations] = await Promise.all([
    directus.request(
      readItems("tenants", {
        fields: ["id", "tenant_name"],
        sort: ["tenant_name"],
        limit: -1,
      })
    ) as unknown as Promise<TenantRow[]>,
    directus.request(
      readItems("location", {
        fields: ["id", "name", "tenant"],
        sort: ["name"],
        limit: -1,
      })
    ) as unknown as Promise<LocationRow[]>,
  ])

  return {
    tenants: tenants.map((row) => ({
      id: row.id,
      name: row.tenant_name ?? "",
    })),
    locations: locations.map((row) => ({
      id: row.id,
      name: row.name ?? "",
      tenant: row.tenant,
    })),
  }
}
