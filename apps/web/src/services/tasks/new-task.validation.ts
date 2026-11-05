import { isDate } from "@/services/time-entries/time-entries.mapper"
import { isUuid } from "@/utils/is-uuid"
import { PRIORITIES, type NewTaskValues } from "./new-task.values"

/** Höchstlängen je Feld; das Formular nutzt sie als maxLength, der Server prüft sie erneut. */
export const MAX_LENGTH = { name: 200, description: 2000 } as const

export type TaskValidationCode = "required" | "invalid" | "tooLong"

export type TaskValidationErrors = Partial<
  Record<keyof NewTaskValues, TaskValidationCode>
>

/** Wird im Browser und in der API-Route genutzt. Längen werden am Rohwert gemessen. */
export function validateNewTask(values: NewTaskValues): TaskValidationErrors {
  const errors: TaskValidationErrors = {}

  if (!values.name.trim()) errors.name = "required"
  else if (values.name.length > MAX_LENGTH.name) errors.name = "tooLong"

  if (!values.projectId) errors.projectId = "required"
  else if (!isUuid(values.projectId)) errors.projectId = "invalid"

  if (!values.dueDate) errors.dueDate = "required"
  else if (!isDate(values.dueDate)) errors.dueDate = "invalid"

  if (values.templateId && !isUuid(values.templateId)) {
    errors.templateId = "invalid"
  }

  if (!(PRIORITIES as readonly string[]).includes(values.priority)) {
    errors.priority = "invalid"
  }

  if (values.description.length > MAX_LENGTH.description) {
    errors.description = "tooLong"
  }

  return errors
}
