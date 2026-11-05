import { parseDayKey } from "@/lib/week"
import type { TimeEntry, TrackedTask } from "@/models/task"
import { toEntryMinutes } from "@/services/time-entries/time-entries.mapper"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

import type { TaskItemRow } from "./tasks.types"

const SECONDS_PER_MINUTE = 60
// Directus speichert nur den Tag; 08:00 Uhr ordnet den Eintrag sicher diesem Tag zu.
const WORKDAY_START_HOUR = 8

function toTimeEntry(taskId: string, row: TimeEntryRow): TimeEntry {
  const startedAt = parseDayKey(row.work_date)
  startedAt.setHours(WORKDAY_START_HOUR)
  return {
    taskId,
    startedAt,
    seconds: toEntryMinutes(row) * SECONDS_PER_MINUTE,
  }
}

/** Bildet eine Directus-Aufgabe ab; ohne Fälligkeit oder bei stornierter Druckstrecke `null`. */
export function toTrackedTask(row: TaskItemRow): TrackedTask | null {
  const line = row.printing_lines
  if (!row.due_date || line?.status === "cancelled") return null
  return {
    id: row.id,
    title: row.task_name ?? "",
    projectId: line?.id ?? "",
    projectName: line?.name ?? "",
    customer: line?.tenant?.tenant_name ?? "",
    priority: row.priority ?? "medium",
    dueDate: parseDayKey(row.due_date),
    done: row.completed ?? false,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    timeEntries: (row.time_entries ?? []).map((entry) =>
      toTimeEntry(row.id, entry)
    ),
  }
}

export function toTrackedTasks(rows: TaskItemRow[]): TrackedTask[] {
  return rows.flatMap((row) => toTrackedTask(row) ?? [])
}
