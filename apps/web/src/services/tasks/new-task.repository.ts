import { createItem, readItem, readItems } from "@directus/sdk"

import { createUserClient } from "@/services/directus/client"

import { toTaskOptions, toTaskPayload } from "./new-task.mapper"
import type { TaskOptionRows, TaskOptions } from "./new-task.types"
import type { NewTaskValues } from "./new-task.values"

export type { TaskOptions }

// Alle Zugriffe laufen mit dem Token der angemeldeten Person (Rolle bestimmt die Rechte).

/** Daten für die Dropdowns des Formulars: offene Projekte und veröffentlichte Vorlagen. */
export async function fetchTaskOptions(
  accessToken: string
): Promise<TaskOptions> {
  const client = await createUserClient(accessToken)
  const [projects, templates] = await Promise.all([
    client.request(
      readItems("printing_lines", {
        fields: [
          "id",
          "name",
          "pal_date",
          "delivery_date",
          "distribution_date",
          "tenant.tenant_name",
        ],
        filter: { status: { _in: ["created", "in progress"] } },
        sort: ["pal_date"],
        limit: -1,
      })
    ) as unknown as Promise<TaskOptionRows["projects"]>,
    client.request(
      readItems("task_templates", {
        fields: [
          "id",
          "task_name",
          "description",
          "due_date_anchor",
          "due_date_offset",
        ],
        filter: { status: { _eq: "published" } },
        sort: ["sort"],
        limit: -1,
      })
    ) as unknown as Promise<TaskOptionRows["templates"]>,
  ])
  return toTaskOptions({ projects, templates })
}

/** Status des Projekts für die Serverprüfung; Directus-403/404 gehen an den Handler. */
export async function fetchTaskProject(
  accessToken: string,
  projectId: string
): Promise<{ status: string | null }> {
  const client = await createUserClient(accessToken)
  return (await client.request(
    readItem("printing_lines", projectId, { fields: ["status"] })
  )) as unknown as { status: string | null }
}

export async function createTask(
  accessToken: string,
  values: NewTaskValues,
  userId: string
): Promise<{ id: string; name: string }> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    createItem("tasks", toTaskPayload(values, userId), {
      fields: ["id", "task_name"],
    })
  )) as unknown as { id: string; task_name: string }
  return { id: row.id, name: row.task_name }
}
