import { diffInCalendarDays } from "@/lib/due-date"
import { getTaskWorkStatus } from "@/lib/task-status"
import { toDayKey } from "@/lib/week"
import type {
  CalendarEntry,
  CalendarEntryStatus,
  CalendarProjectEntry,
  CalendarTaskEntry,
} from "@/models/calendar-entry"
import type { Project } from "@/models/project"
import type { Task, TimeEntry, TrackedTask } from "@/models/task"

/**
 * Wichtigster Eintrag zuerst: Überfällig -> In Bearbeitung -> Offen -> Abgeschlossen;
 * bei Gleichstand frühere Fälligkeit, dann Projekt vor Aufgabe.
 */
export const STATUS_RANK: Record<CalendarEntryStatus, number> = {
  overdue: 0,
  inProgress: 1,
  open: 2,
  done: 3,
}

/** Bei sonst gleichem Rang: Projekt vor Aufgabe (übergeordnete Einheit). */
const KIND_RANK: Record<CalendarEntry["kind"], number> = {
  project: 0,
  task: 1,
}

/**
 * IDs aller Aufgaben, an denen schon gearbeitet wurde: Zeiteinträge in den
 * Aufgabendaten, per Timer gebuchte Zeit (Store) oder aktuell laufender Timer.
 */
export function getStartedTaskIds(
  tasks: TrackedTask[],
  bookedEntries: TimeEntry[],
  activeTaskId: string | null
): Set<string> {
  const ids = new Set<string>()
  for (const task of tasks) {
    if (task.timeEntries.length > 0) ids.add(task.id)
  }
  for (const entry of bookedEntries) ids.add(entry.taskId)
  if (activeTaskId) ids.add(activeTaskId)
  return ids
}

/**
 * Chip-Status: erledigt -> Abgeschlossen; Zeit erfasst -> In Bearbeitung (auch
 * wenn überfällig, die Fußzeile ist dann rot); sonst Überfällig oder Offen.
 */
export function taskToEntry(
  task: Task,
  today: Date,
  startedTaskIds: ReadonlySet<string> = new Set()
): CalendarTaskEntry {
  const workStatus = getTaskWorkStatus(task, startedTaskIds)
  const status: CalendarEntryStatus =
    workStatus === "open" && diffInCalendarDays(task.dueDate, today) < 0
      ? "overdue"
      : workStatus
  return {
    kind: "task",
    id: `task-${task.id}`,
    taskId: task.id,
    title: task.title,
    projectName: task.projectName,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    status,
  }
}

/** Projekte erscheinen am PAL-Datum; nur aktive Projekte haben einen Kalender-Status. */
export function projectToEntry(project: Project): CalendarProjectEntry | null {
  if (project.status !== "active") return null
  return {
    kind: "project",
    id: `project-${project.id}`,
    name: project.name,
    customer: project.customer,
    progress: project.progress,
    dueDate: project.palDate,
    status: "inProgress",
  }
}

/**
 * Datenquelle des Kalenders: alle Aufgaben und alle aktiven Projekte als `CalendarEntry`.
 * `startedTaskIds` (siehe `getStartedTaskIds`) bestimmt, welche Aufgaben in Bearbeitung sind.
 * Kommen die Daten später aus Directus, reicht es, sie auf `Task`/`Project` zu mappen.
 */
export function toCalendarEntries(
  tasks: Task[],
  projects: Project[],
  today: Date,
  startedTaskIds: ReadonlySet<string> = new Set()
): CalendarEntry[] {
  return [
    ...tasks.map((task) => taskToEntry(task, today, startedTaskIds)),
    ...projects.flatMap((project) => projectToEntry(project) ?? []),
  ]
}

export function compareByImportance(
  a: CalendarEntry,
  b: CalendarEntry
): number {
  return (
    STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
    a.dueDate.getTime() - b.dueDate.getTime() ||
    KIND_RANK[a.kind] - KIND_RANK[b.kind]
  )
}

export { toDayKey }

/** Gruppiert nach Fälligkeitstag; je Tag steht der wichtigste Eintrag vorne. */
export function groupEntriesByDay(
  entries: CalendarEntry[]
): Map<string, CalendarEntry[]> {
  const groups = new Map<string, CalendarEntry[]>()
  for (const entry of [...entries].sort(compareByImportance)) {
    const key = toDayKey(entry.dueDate)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return groups
}

/**
 * Behält je Tag eine gemerkte Reihenfolge (Eintrags-IDs) bei, z.B. direkt nach dem
 * Abhaken - sonst würde die Card sofort ans Ende rutschen. Neue Einträge kommen
 * in ihrer Wichtigkeits-Reihenfolge dahinter.
 */
export function withPinnedOrder(
  groups: Map<string, CalendarEntry[]>,
  pinned: Record<string, string[]>
): Map<string, CalendarEntry[]> {
  const result = new Map<string, CalendarEntry[]>()
  for (const [key, entries] of groups) {
    const order = pinned[key]
    if (!order) {
      result.set(key, entries)
      continue
    }
    const position = new Map(order.map((id, index) => [id, index]))
    const rank = (entry: CalendarEntry) =>
      position.get(entry.id) ?? order.length
    result.set(
      key,
      [...entries].sort((a, b) => rank(a) - rank(b))
    )
  }
  return result
}
