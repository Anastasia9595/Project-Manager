import { readItems } from "@directus/sdk"

import type { TrackedTask } from "@/models/task"
import { createUserClient } from "@/services/directus/client"

import { toTrackedTasks } from "./tasks.mapper"
import type { TaskItemRow } from "./tasks.types"

const FIELDS = [
  "id",
  "task_name",
  "priority",
  "due_date",
  "completed",
  "completed_at",
  "printing_lines.id",
  "printing_lines.name",
  "printing_lines.status",
  "printing_lines.tenant.tenant_name",
  "time_entries.work_date",
  "time_entries.hours",
  "time_entries.minutes",
]

/** Aufgaben der angemeldeten Person ohne stornierte Druckstrecken, nach Fälligkeit sortiert. */
export async function fetchMyTasks(
  accessToken: string
): Promise<TrackedTask[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("tasks", {
      fields: FIELDS,
      filter: {
        assigned_to: { _eq: "$CURRENT_USER" },
        printing_lines: { status: { _neq: "cancelled" } },
      },
      sort: ["due_date"],
      limit: -1,
    })
  )) as unknown as TaskItemRow[]
  return toTrackedTasks(rows)
}
