export type TaskPriority = "high" | "medium" | "low"

export type Task = {
  id: string
  title: string
  projectName: string
  priority: TaskPriority
  dueDate: Date
  done: boolean
  /** Zeitpunkt des Abhakens - nur bei erledigten Aufgaben gesetzt. */
  completedAt?: Date
}

export type TimeEntry = {
  taskId: string
  startedAt: Date
  seconds: number
}

/** Aufgabe mit Kunde und Zeiterfassung - Grundlage der Aufgaben-Seite. */
export type TrackedTask = Task & {
  /** Verweis auf `Project.id` (in Directus: Relation `project`). */
  projectId: string
  customer: string
  timeEntries: TimeEntry[]
}

/** Zeile der Aufgaben-Tabelle: Aufgabe plus aktueller Timer-Zustand. */
export type TaskRow = TrackedTask & {
  /** Gebuchte Zeit inkl. laufendem Timer. */
  trackedSeconds: number
  isRunning: boolean
  /** false, solange ein Timer für eine andere Aufgabe läuft. */
  canStart: boolean
}
