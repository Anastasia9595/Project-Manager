import { getProfileAvatarUrl } from "@/lib/profile-fields"
import type { CustomerContact } from "@/models/customer-contact"
import { getFullName } from "@/utils/full-name"

import type { LocationRow, TenantRow } from "./customer-contacts.types"

const POSITION_PRIORITY = [
  "management",
  "werbeabteilung",
  "assistenz_von_fr_seifert",
  "assistenz_empfang",
]

function positionRank(position: string | null): number {
  const index = POSITION_PRIORITY.indexOf(position ?? "")
  return index === -1 ? POSITION_PRIORITY.length : index
}

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
  const users = [...(row.tenant_users ?? [])].sort(
    (a, b) => positionRank(a.positions) - positionRank(b.positions)
  )
  const main = locations.find((location) => location.is_primary) ?? locations[0]

  return {
    id: row.id,
    customer: row.tenant_name ?? "",
    // Der Avatar-Proxy liefert jede Directus-Datei mit dem Token der angemeldeten Person aus.
    logoUrl: row.logo ? getProfileAvatarUrl(row.logo) : undefined,
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
