import type { Dictionary } from "@/i18n"
import type { SelectOption } from "@/lib/customer-contact-form/options"
import { computeDueDate } from "@/services/tasks/new-task.mapper"
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

/** Fälligkeit aus Vorlage und Projekt; "" ohne Ankerdatum. */
function dueDateFor(
  template: TaskOptions["templates"][number],
  options: TaskOptions,
  projectId: string,
  today: string
): string {
  const project = options.projects.find((item) => item.id === projectId)
  return computeDueDate(template, project, today)
}

/**
 * Wählt eine Vorlage: füllt Titel, Beschreibung und Fälligkeit vor.
 * Ohne Vorlage (`""`) wird nur die Vorlage geleert, die Werte bleiben stehen.
 */
export function applyTemplate(
  values: NewTaskValues,
  templateId: string,
  options: TaskOptions | undefined,
  today: string
): NewTaskValues {
  const template = options?.templates.find((item) => item.id === templateId)
  if (!options || !template) return { ...values, templateId }
  return {
    ...values,
    templateId,
    name: template.name,
    description: template.description,
    dueDate: dueDateFor(template, options, values.projectId, today),
  }
}

/**
 * Wählt ein Projekt. Ist eine Vorlage gewählt und die Fälligkeit seit der letzten
 * Vorbelegung nicht von Hand geändert (`dueDateTouched`), wird sie neu berechnet.
 */
export function applyProject(
  values: NewTaskValues,
  projectId: string,
  options: TaskOptions | undefined,
  dueDateTouched: boolean,
  today: string
): NewTaskValues {
  const next = { ...values, projectId }
  const template = options?.templates.find(
    (item) => item.id === values.templateId
  )
  if (!options || !template || dueDateTouched) return next
  return { ...next, dueDate: dueDateFor(template, options, projectId, today) }
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
    default:
      return errors.saveError
  }
}
