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
  "buffer_days",
  "circulation",
  "tenant.tenant_name",
  "tasks.completed",
]

/** Nicht stornierte Druckstrecken, die die Rolle der angemeldeten Person sehen darf, nach PAL sortiert. */
export async function fetchProjects(accessToken: string): Promise<Project[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("printing_lines", {
      fields: FIELDS,
      filter: { status: { _neq: "cancelled" } },
      sort: ["pal_date"],
      limit: -1,
    })
  )) as unknown as PrintingLineRow[]
  return toProjects(rows)
}
