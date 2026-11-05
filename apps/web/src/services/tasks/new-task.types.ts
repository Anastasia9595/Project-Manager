export type DueDateAnchor =
  "date_created" | "pal_date" | "delivery_date" | "distribution_date"

export type TaskOptions = {
  projects: {
    id: string
    name: string
    customer: string
    palDate: string | null
    deliveryDate: string | null
    distributionDate: string | null
  }[]
  templates: {
    id: string
    name: string
    description: string
    anchor: DueDateAnchor
    offset: number
  }[]
}

/** Rohzeilen der Dropdown-Collections (Directus-Feldnamen). */
export type TaskOptionRows = {
  projects: {
    id: string
    name: string | null
    pal_date: string | null
    delivery_date: string | null
    distribution_date: string | null
    tenant: { tenant_name: string | null } | null
  }[]
  templates: {
    id: string
    task_name: string
    description: string | null
    due_date_anchor: DueDateAnchor
    due_date_offset: number
  }[]
}
