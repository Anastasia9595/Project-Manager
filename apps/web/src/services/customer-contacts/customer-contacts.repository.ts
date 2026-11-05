import { readItem, readItems } from "@directus/sdk"

import type { CustomerContact } from "@/models/customer-contact"
import { createUserClient } from "@/services/directus/client"

import { toCustomerContact } from "./customer-contacts.mapper"
import type { TenantRow } from "./customer-contacts.types"

const FIELDS = [
  "id",
  "tenant_name",
  "logo",
  "main_email",
  "main_phone",
  "notes",
  "date_created",
  "distributor.name",
  "locations.id",
  "locations.name",
  "locations.is_primary",
  "locations.street",
  "locations.postal_code",
  "locations.city",
  "locations.phone",
  "locations.email",
  "locations.website",
  "tenant_users.id",
  "tenant_users.first_name",
  "tenant_users.last_name",
  "tenant_users.positions",
  "tenant_users.email",
  "tenant_users.phone",
]

// Zugriffe laufen mit dem Token der angemeldeten Person, damit ihre Directus-Rolle
// bestimmt, welche Kunden sie sehen.

export async function fetchCustomerContacts(
  accessToken: string
): Promise<CustomerContact[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("tenants", { fields: FIELDS, sort: ["tenant_name"], limit: -1 })
  )) as unknown as TenantRow[]
  return rows.map((row) => toCustomerContact(row))
}

export async function fetchCustomerContact(
  accessToken: string,
  id: string,
  positionLabels?: Record<string, string>
): Promise<CustomerContact> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    readItem("tenants", id, { fields: FIELDS })
  )) as unknown as TenantRow
  return toCustomerContact(row, positionLabels)
}
