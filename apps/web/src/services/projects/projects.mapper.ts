import { addDays, parseDayKey } from "@/lib/week"
import type { Project, ProjectStatus } from "@/models/project"

import type { PrintingLineRow, PrintingLineStatus } from "./projects.types"

const STATUS: Record<
  Exclude<PrintingLineStatus, "cancelled">,
  ProjectStatus
> = {
  created: "created",
  "in progress": "active",
  completed: "completed",
  invoiced: "completed",
}

/** Bildet eine Druckstrecke auf ein Projekt ab; stornierte (oder ohne PAL) liefern `null`. */
export function toProject(row: PrintingLineRow): Project | null {
  if (row.status === "cancelled" || !row.pal_date) return null
  const tasks = row.tasks ?? []
  const palDate = parseDayKey(row.pal_date)
  return {
    id: row.id,
    name: row.name ?? "",
    status: STATUS[row.status ?? "created"],
    palDate,
    dataHandoverDate: addDays(palDate, -(row.buffer_days ?? 0)),
    customer: row.tenant?.tenant_name ?? "",
    progress: {
      done: tasks.filter((task) => task.completed).length,
      total: tasks.length,
    },
    circulation: row.circulation ?? 0,
  }
}

export function toProjects(rows: PrintingLineRow[]): Project[] {
  return rows.flatMap((row) => toProject(row) ?? [])
}
