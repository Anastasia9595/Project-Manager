import type { Dictionary } from "@/i18n"
import type { SelectOption } from "@/lib/customer-contact-form/options"
import type { TaskOptions } from "@/services/tasks/new-task.types"
import type { TaskValidationCode } from "@/services/tasks/new-task.validation"
import type { NewTaskValues } from "@/services/tasks/new-task.values"

export type TaskFormTexts = Dictionary["tasksPage"]["form"]
type ValidationTexts = TaskFormTexts["validation"]

/** Projekte als „Projektname – Kunde“ (ohne Kunde nur der Name). */
export function toProjectOptions(options: TaskOptions): SelectOption[] {
  return options.projects.map((project) => ({
    value: project.id,
    label: project.customer
      ? `${project.name} – ${project.customer}`
      : project.name,
  }))
}

export function toTemplateOptions(options: TaskOptions): SelectOption[] {
  return options.templates.map((template) => ({
    value: template.id,
    label: template.name,
  }))
}

/** Meldung zu einem Validierungsfehler eines Feldes; `undefined`, wenn es keinen Fehler gibt. */
export function getFieldMessage(
  code: TaskValidationCode | undefined,
  field: keyof NewTaskValues,
  validation: ValidationTexts
): string | undefined {
  switch (code) {
    case "required":
      return field in validation.required
        ? validation.required[field as keyof ValidationTexts["required"]]
        : undefined
    case "tooLong":
      return validation.tooLong
    case "invalid":
      return field === "dueDate" ? validation.invalidDate : validation.invalid
    default:
      return undefined
  }
}

/** Meldung zum Fehlercode der API nach einem fehlgeschlagenen Speichern. */
export function getSubmitErrorMessage(
  code: string,
  errors: TaskFormTexts["errors"]
): string {
  switch (code) {
    case "unauthorized":
      return errors.sessionExpired
    case "forbidden":
      return errors.forbidden
    case "invalid_project":
      return errors.invalidProject
    // Bei Netzwerkfehler/Zeitüberschreitung kann die Aufgabe trotzdem angelegt sein.
    case "network_error":
      return errors.timeout
    default:
      return errors.saveError
  }
}
