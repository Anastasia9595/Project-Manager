import { getProjectTitle } from "@/lib/projects"
import { formatClockMinutes } from "@/lib/time-tracking/calculations/duration"
import { formatPlainDate } from "@/lib/time-tracking/date-labels"
import { formatWeekParam } from "@/lib/time-tracking/week-param"
import { parseDayKey } from "@/lib/week"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"
import type { TimeBooking } from "@/models/time-booking"

/** Semikolon statt Komma: so öffnet ein deutsches Excel die Datei direkt in Spalten. */
const SEPARATOR = ";"
const LINE_BREAK = "\r\n"
const NEEDS_QUOTES = /[";\r\n]/
/** Zellen mit diesen Anfangszeichen führt Excel als Formel aus. */
const FORMULA_START = /^[=+\-@]/

export type CsvLabels = {
  date: string
  project: string
  projectId: string
  task: string
  duration: string
  minutes: string
  description: string
}

function escapeCsvValue(raw: string): string {
  const value = FORMULA_START.test(raw) ? `'${raw}` : raw
  return NEEDS_QUOTES.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

function toCsvLine(values: (string | number)[]): string {
  return values.map((value) => escapeCsvValue(String(value))).join(SEPARATOR)
}

/** Eine Zeile je Buchung, nach Datum sortiert. */
export function buildWeekCsv(
  entries: TimeBooking[],
  projects: Project[],
  tasks: TrackedTask[],
  labels: CsvLabels
): string {
  const projectById = new Map(projects.map((project) => [project.id, project]))
  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const header = toCsvLine([
    labels.date,
    labels.project,
    labels.projectId,
    labels.task,
    labels.duration,
    labels.minutes,
    labels.description,
  ])
  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => {
      const project = projectById.get(entry.project)
      return toCsvLine([
        formatPlainDate(parseDayKey(entry.date)),
        project ? getProjectTitle(project) : "",
        project?.name ?? entry.project,
        taskById.get(entry.task)?.title ?? "",
        formatClockMinutes(entry.duration_minutes),
        entry.duration_minutes,
        entry.description ?? "",
      ])
    })
  return [header, ...rows].join(LINE_BREAK)
}

/** z.B. "zeiterfassung-2026-W42.csv" */
export function weekCsvFileName(weekStart: Date): string {
  return `zeiterfassung-${formatWeekParam(weekStart)}.csv`
}
