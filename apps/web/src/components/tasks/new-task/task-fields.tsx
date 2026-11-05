import { useMemo } from "react"

import { FormGrid } from "@/components/settings/form-field"
import type { NewTaskFormState } from "@/hooks/use-new-task-form"
import type { TaskPriority } from "@/models/task"
import type { TaskOptions } from "@/services/tasks/new-task.types"
import { MAX_LENGTH } from "@/services/tasks/new-task.validation"
import { PRIORITIES } from "@/services/tasks/new-task.values"
import {
  toProjectOptions,
  toTemplateOptions,
  type TaskFormTexts,
} from "./form-helpers"
import { TaskDateField } from "./task-date-field"
import { TaskDescriptionField } from "./task-description-field"
import { TaskSelectField } from "./task-select-field"
import { TaskTextField } from "./task-text-field"

/** Felder der Aufgabe: Vorlage, Titel, Projekt, Fälligkeit, Priorität und Beschreibung. */
export function TaskFields({
  form,
  options,
  t,
}: {
  form: NewTaskFormState
  options: TaskOptions
  t: TaskFormTexts
}) {
  const p = t.placeholders
  const lists = useMemo(
    () => ({
      templates: toTemplateOptions(options),
      projects: toProjectOptions(options),
    }),
    [options]
  )
  const priorities = useMemo(
    () => PRIORITIES.map((value) => ({ value, label: t.priorities[value] })),
    [t.priorities]
  )

  return (
    <FormGrid>
      <TaskSelectField
        form={form}
        t={t}
        name="templateId"
        label={t.template}
        options={lists.templates}
        placeholder={p.template}
        emptyLabel={p.templateEmpty}
        onValueChange={form.setTemplate}
        className="sm:col-span-2"
      />
      <TaskTextField
        form={form}
        t={t}
        name="name"
        label={t.name}
        placeholder={p.name}
        maxLength={MAX_LENGTH.name}
        required
        autoFocus
        className="sm:col-span-2"
      />
      <TaskSelectField
        form={form}
        t={t}
        name="projectId"
        label={t.project}
        options={lists.projects}
        placeholder={lists.projects.length ? p.project : p.projectNone}
        disabled={lists.projects.length === 0}
        onValueChange={form.setProject}
        required
        className="sm:col-span-2"
      />
      <TaskDateField form={form} t={t} />
      <TaskSelectField
        form={form}
        t={t}
        name="priority"
        label={t.priority}
        options={priorities}
        placeholder={p.priority}
        // Ohne Leer-Eintrag liefert die Auswahl immer eine der Prioritäten.
        onValueChange={(next) =>
          form.setField("priority", next as TaskPriority)
        }
      />
      <TaskDescriptionField form={form} t={t} />
    </FormGrid>
  )
}
