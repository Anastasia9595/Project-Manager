/** Status, nach dem Einträge im Kalender eingefärbt und sortiert werden. */
export type CalendarEntryStatus = "overdue" | "inProgress" | "open" | "done"

type CalendarEntryBase = {
  id: string
  /** Tag, an dem der Eintrag im Kalender erscheint. */
  dueDate: Date
  status: CalendarEntryStatus
}

export type CalendarTaskEntry = CalendarEntryBase & {
  kind: "task"
  taskId: string
  title: string
  projectName: string
  completedAt?: Date
}

export type CalendarProjectEntry = CalendarEntryBase & {
  kind: "project"
  name: string
  customer: string
  progress: { done: number; total: number }
}

/** Gemeinsame Form für Aufgaben und Projekte im Kalender. */
export type CalendarEntry = CalendarTaskEntry | CalendarProjectEntry
