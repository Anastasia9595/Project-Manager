// Formularwerte "Neue Aufgabe" (Collection tasks).
import type { TaskPriority } from "@/models/task"

export const PRIORITIES = ["high", "medium", "low"] as const

export type NewTaskValues = {
  /** Leer oder UUID; nur Anzeige/Vorbelegung, wird nicht gespeichert. */
  templateId: string
  name: string
  /** UUID. */
  projectId: string
  /** YYYY-MM-DD */
  dueDate: string
  priority: TaskPriority
  description: string
}

export const EMPTY_NEW_TASK_VALUES: NewTaskValues = {
  templateId: "",
  name: "",
  projectId: "",
  dueDate: "",
  priority: "medium",
  description: "",
}

export function isNewTaskValues(body: unknown): body is NewTaskValues {
  if (typeof body !== "object" || body === null) return false
  const record = body as Record<string, unknown>
  return (
    Object.keys(EMPTY_NEW_TASK_VALUES).every(
      (key) => typeof record[key] === "string"
    ) && (PRIORITIES as readonly string[]).includes(record.priority as string)
  )
}
