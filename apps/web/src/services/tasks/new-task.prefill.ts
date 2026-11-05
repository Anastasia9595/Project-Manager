import { computeDueDate } from "@/services/tasks/new-task.mapper"
import type { TaskOptions } from "@/services/tasks/new-task.types"
import type { NewTaskValues } from "@/services/tasks/new-task.values"

// Vorbelegung des Formulars "Neue Aufgabe" aus Vorlage und Projekt (reine Funktionen).

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
