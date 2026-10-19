import { minutesByDay, sumValues } from "@/lib/time-tracking/calculations/totals"
import { getProjectTitle } from "@/lib/projects"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"
import type { TimeBooking } from "@/models/time-booking"

// Zeilen der Wochenübersicht (Projekt -> Aufgaben) und ihre Sortierung.

export type OverviewTaskRow = {
  task: TrackedTask
  minutesByDay: number[]
  total: number
}

export type OverviewProjectGroup = {
  project: Project
  tasks: OverviewTaskRow[]
  minutesByDay: number[]
  total: number
}

function buildRow(
  entries: TimeBooking[],
  days: Date[]
): { minutesByDay: number[]; total: number } {
  const perDay = minutesByDay(entries, days)
  return { minutesByDay: perDay, total: sumValues(perDay) }
}

/**
 * Gruppiert die Buchungen nach Projekt und Aufgabe. Es erscheinen alle
 * Projekte mit mindestens einer Buchung – jeweils mit all ihren Aufgaben.
 */
export function buildWeekOverview(
  entries: TimeBooking[],
  projects: Project[],
  tasks: TrackedTask[],
  days: Date[]
): OverviewProjectGroup[] {
  const bookedProjectIds = new Set(entries.map((entry) => entry.project))
  return projects
    .filter((project) => bookedProjectIds.has(project.id))
    .map((project) => ({
      project,
      ...buildRow(
        entries.filter((entry) => entry.project === project.id),
        days
      ),
      tasks: tasks
        .filter((task) => task.projectId === project.id)
        .map((task) => ({
          task,
          ...buildRow(
            entries.filter((entry) => entry.task === task.id),
            days
          ),
        })),
    }))
}

export type OverviewSortKey = "name" | "total"
export type SortDirection = "asc" | "desc"
export type OverviewSort = { key: OverviewSortKey; direction: SortDirection }

const NAME_COLLATOR = new Intl.Collator("de-DE")

function compareBy<T>(
  key: OverviewSortKey,
  direction: SortDirection,
  nameOf: (item: T) => string,
  totalOf: (item: T) => number
): (a: T, b: T) => number {
  const sign = direction === "asc" ? 1 : -1
  return (a, b) =>
    sign *
    (key === "name"
      ? NAME_COLLATOR.compare(nameOf(a), nameOf(b))
      : totalOf(a) - totalOf(b))
}

/** Sortiert Projekte und die Aufgaben darin; ohne Sortierung bleibt die Reihenfolge. */
export function sortOverview(
  groups: OverviewProjectGroup[],
  sort: OverviewSort | null
): OverviewProjectGroup[] {
  if (!sort) return groups
  const compareTasks = compareBy<OverviewTaskRow>(
    sort.key,
    sort.direction,
    (row) => row.task.title,
    (row) => row.total
  )
  const compareProjects = compareBy<OverviewProjectGroup>(
    sort.key,
    sort.direction,
    (group) => getProjectTitle(group.project),
    (group) => group.total
  )
  return [...groups]
    .map((group) => ({ ...group, tasks: [...group.tasks].sort(compareTasks) }))
    .sort(compareProjects)
}

/** Klick auf einen Spaltenkopf: neue Spalte aufsteigend, sonst Richtung umkehren. */
export function toggleSort(
  current: OverviewSort | null,
  key: OverviewSortKey
): OverviewSort {
  if (current?.key !== key) return { key, direction: "asc" }
  return { key, direction: current.direction === "asc" ? "desc" : "asc" }
}
