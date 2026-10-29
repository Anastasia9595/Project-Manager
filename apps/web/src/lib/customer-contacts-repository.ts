import { readItem, readItems } from "@directus/sdk"

import { createUserClient } from "@/lib/auth/user-client"
import type { CustomerContact } from "@/models/customer-contact"
import { getFullName } from "@/utils/full-name"

type LocationRow = {
  id: string
  name: string | null
  is_primary: boolean | null
  street: string | null
  postal_code: number | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
}

type UserRow = {
  id: string
  first_name: string | null
  last_name: string | null
  positions: string | null
  email: string | null
  phone: string | null
}

type TenantRow = {
  id: string
  tenant_name: string | null
  main_email: string | null
  main_phone: string | null
  notes: string | null
  date_created: string | null
  distributor: { name: string | null } | null
  locations: LocationRow[] | null
  tenant_users: UserRow[] | null
}

const FIELDS = [
  "id",
  "tenant_name",
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

function formatAddress(location?: LocationRow): string {
  if (!location) return ""
  const town = [location.postal_code, location.city].filter(Boolean).join(" ")
  return [location.street, town].filter(Boolean).join(", ")
}

/** Bildet einen Directus-Tenant auf die Felder ab, die Tabelle und Detailseite erwarten. */
export function toCustomerContact(
  row: TenantRow,
  positionLabels: Record<string, string> = {}
): CustomerContact {
  const locations = row.locations ?? []
  const users = row.tenant_users ?? []
  const main = locations.find((location) => location.is_primary) ?? locations[0]

  return {
    id: row.id,
    customer: row.tenant_name ?? "",
    contactPerson: getFullName(users[0]?.first_name, users[0]?.last_name),
    website: main?.website ?? "",
    email: row.main_email ?? "",
    phone: row.main_phone ?? "",
    address: formatAddress(main),
    association: row.distributor?.name ?? "",
    createdAt: row.date_created?.slice(0, 10),
    note: row.notes ?? undefined,
    contacts: users.map((user) => ({
      id: user.id,
      name: getFullName(user.first_name, user.last_name),
      position: positionLabels[user.positions ?? ""] ?? user.positions ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
    })),
    branches: locations.map((location) => ({
      id: location.id,
      name: location.name ?? "",
      address: formatAddress(location),
      phone: location.phone ?? "",
      email: location.email ?? "",
    })),
  }
}

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
