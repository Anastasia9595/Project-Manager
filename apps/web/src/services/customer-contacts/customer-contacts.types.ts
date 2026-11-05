/** Zeilen aus Directus, nur die geladenen Felder. */
export type LocationRow = {
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

export type UserRow = {
  id: string
  first_name: string | null
  last_name: string | null
  positions: string | null
  email: string | null
  phone: string | null
}

export type TenantRow = {
  id: string
  tenant_name: string | null
  logo: string | null
  main_email: string | null
  main_phone: string | null
  notes: string | null
  date_created: string | null
  distributor: { name: string | null } | null
  locations: LocationRow[] | null
  tenant_users: UserRow[] | null
}
