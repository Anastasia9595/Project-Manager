import { addDays, isSameDay, startOfWeek } from "@/lib/week"
import type { TaskRow, TimeEntry, TrackedTask } from "@/models/task"
import type { ActiveTimer } from "@/lib/task-timer-store"
import { sortByPriority } from "@/lib/tasks"

export type TaskGroupKey = "overdue" | "today" | "thisWeek" | "later"

export const TASK_GROUP_ORDER: TaskGroupKey[] = [
  "overdue",
  "today",
  "thisWeek",
  "later",
]

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getTaskGroup(dueDate: Date, today: Date): TaskGroupKey {
  const due = startOfDay(dueDate)
  const start = startOfDay(today)
  if (due < start) return "overdue"
  if (isSameDay(due, start)) return "today"
  // "Diese Woche" = die nächsten 7 Tage, damit die Gruppe auch sonntags nicht leer ist.
  if (due <= addDays(start, 7)) return "thisWeek"
  return "later"
}

/** Gruppiert nach Fälligkeit; innerhalb einer Gruppe nach Datum, dann Priorität sortiert. */
export function groupTasksByDue<T extends TrackedTask>(
  tasks: T[],
  today: Date
): Record<TaskGroupKey, T[]> {
  const groups: Record<TaskGroupKey, T[]> = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
  }
  const sorted = sortByPriority(tasks).sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  )
  for (const task of sorted) {
    groups[getTaskGroup(task.dueDate, today)].push(task)
  }
  return groups
}

export function getRunningSeconds(
  active: ActiveTimer | null,
  now: number
): number {
  return active ? Math.max(0, Math.floor((now - active.startedAt) / 1000)) : 0
}

export function sumEntrySeconds(entries: TimeEntry[], since?: Date): number {
  return entries
    .filter((entry) => !since || entry.startedAt >= since)
    .reduce((total, entry) => total + entry.seconds, 0)
}

/** Ergänzt die Aufgaben um gebuchte Zeit und Timer-Status für die Tabelle. */
export function buildTaskRows(
  tasks: TrackedTask[],
  entries: TimeEntry[],
  active: ActiveTimer | null,
  runningSeconds: number
): TaskRow[] {
  const secondsByTask = new Map<string, number>()
  for (const entry of entries) {
    secondsByTask.set(
      entry.taskId,
      (secondsByTask.get(entry.taskId) ?? 0) + entry.seconds
    )
  }
  return tasks.map((task) => {
    const isRunning = active?.taskId === task.id
    return {
      ...task,
      trackedSeconds:
        (secondsByTask.get(task.id) ?? 0) + (isRunning ? runningSeconds : 0),
      isRunning,
      canStart: !active,
    }
  })
}

export function getTimeSummary(
  entries: TimeEntry[],
  active: ActiveTimer | null,
  now: number
) {
  const today = startOfDay(new Date(now))
  const running = getRunningSeconds(active, now)
  return {
    todaySeconds: sumEntrySeconds(entries, today) + running,
    weekSeconds: sumEntrySeconds(entries, startOfWeek(today)) + running,
  }
}

/** z.B. 9300 -> "2:35" (Stunden:Minuten) */
export function formatHoursMinutes(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}:${String(minutes).padStart(2, "0")}`
}

/** z.B. 2533 -> "00:42:13" */
export function formatClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [hours, minutes, secs]
    .map((part) => String(part).padStart(2, "0"))
    .join(":")
}

export function matchesTaskQuery(task: TrackedTask, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [task.title, task.projectName, task.customer].some((value) =>
    value.toLowerCase().includes(needle)
  )
}
