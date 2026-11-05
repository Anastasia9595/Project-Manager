import { readItems, updateItem } from "@directus/sdk"

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
      // Admins sehen sonst die Buchungen anderer Personen auf ihren Aufgaben.
      deep: {
        time_entries: { _filter: { user_created: { _eq: "$CURRENT_USER" } } },
      },
      sort: ["due_date"],
      limit: -1,
    })
  )) as unknown as TaskItemRow[]
  return toTrackedTasks(rows)
}

/** Setzt den Erledigt-Status; `completed_at` wird mit gesetzt bzw. geleert. Directus prüft, ob die Person die Aufgabe ändern darf. */
export async function updateTaskCompletion(
  accessToken: string,
  id: string,
  completed: boolean
): Promise<{ id: string; completed: boolean; completedAt: string | null }> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    updateItem(
      "tasks",
      id,
      { completed, completed_at: completed ? new Date().toISOString() : null },
      { fields: ["id", "completed", "completed_at"] }
    )
  )) as unknown as {
    id: string
    completed: boolean
    completed_at: string | null
  }
  return { id: row.id, completed: row.completed, completedAt: row.completed_at }
}
