import { createItem, readItem, readItems } from "@directus/sdk"

import { createUserClient } from "@/lib/auth/user-client"
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

// Alle Zugriffe laufen mit dem Token der angemeldeten Person, damit ihre
// Directus-Rolle bestimmt, welche Kunden sie sehen und anlegen darf.

/** Legt eine Kontaktperson in tenant_users an (Status bleibt der Directus-Standard "draft"). */
export async function createTenantUser(
  accessToken: string,
  values: CustomerContactValues
): Promise<void> {
  const client = await createUserClient(accessToken)
  await client.request(createItem("tenant_users", toDirectusPayload(values)))
}

/** Kunde, zu dem ein Standort gehört (`null`, wenn er keinem Kunden zugeordnet ist). */
export async function fetchLocationTenant(
  accessToken: string,
  locationId: string
): Promise<string | null> {
  const client = await createUserClient(accessToken)
  const location = (await client.request(
    readItem("location", locationId, { fields: ["tenant"] })
  )) as unknown as Pick<LocationRow, "tenant">
  return location.tenant
}

/** Kunden und Standorte für die Dropdowns des Formulars. */
export async function fetchContactOptions(
  accessToken: string
): Promise<ContactOptions> {
  const client = await createUserClient(accessToken)
  const [tenants, locations] = await Promise.all([
    client.request(
      readItems("tenants", {
        fields: ["id", "tenant_name"],
        sort: ["tenant_name"],
        limit: -1,
      })
    ) as unknown as Promise<TenantRow[]>,
    client.request(
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
