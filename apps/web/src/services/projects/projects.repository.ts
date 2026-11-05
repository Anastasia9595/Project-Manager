import { readItems } from "@directus/sdk"

import type { Project } from "@/models/project"
import { createUserClient } from "@/services/directus/client"

import { toProjects } from "./projects.mapper"
import type { PrintingLineRow } from "./projects.types"

const FIELDS = [
  "id",
  "name",
  "status",
  "pal_date",
  "circulation",
  "tenant.tenant_name",
  "tasks.completed",
]

/** Nicht stornierte Druckstrecken, die die Rolle der angemeldeten Person sehen darf, nach PAL sortiert. */
export async function fetchProjects(
  accessToken: string,
  options: { includeHandover?: boolean } = {}
): Promise<Project[]> {
  const { includeHandover = true } = options
  // Kunden-Rolle darf buffer_days nicht lesen (sonst 403 für die ganze Anfrage).
  const fields = includeHandover ? [...FIELDS, "buffer_days"] : FIELDS
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("printing_lines", {
      fields,
      filter: { status: { _neq: "cancelled" } },
      sort: ["pal_date"],
      limit: -1,
    })
  )) as unknown as PrintingLineRow[]
  return toProjects(rows)
}
