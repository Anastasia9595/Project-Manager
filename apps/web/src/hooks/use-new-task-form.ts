import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type SubmitEvent,
} from "react"

import {
  applyProject,
  applyTemplate,
} from "@/components/tasks/new-task/form-helpers"
import { toDayKey } from "@/lib/week"
import type { TaskOptions } from "@/services/tasks/new-task.types"
import {
  validateNewTask,
  type TaskValidationErrors,
} from "@/services/tasks/new-task.validation"
import {
  EMPTY_NEW_TASK_VALUES,
  type NewTaskValues,
} from "@/services/tasks/new-task.values"
import { submitNewTask } from "@/services/tasks/tasks.client"

export type NewTaskFormState = ReturnType<typeof useNewTaskForm>

/**
 * Zustand und Ablauf des Formulars "Neue Aufgabe" (wie `useNewProjectForm`): Werte,
 * Feldfehler, Vorbelegung aus Vorlagen, Absenden und der Sprung ins erste fehlerhafte Feld.
 */
export function useNewTaskForm({
  formRef,
  onCreated,
  onSavingChange,
  options,
}: {
  formRef: RefObject<HTMLFormElement | null>
  /** Wird mit dem Namen der neuen Aufgabe aufgerufen. */
  onCreated: (name: string) => void
  onSavingChange: (saving: boolean) => void
  /** Projekte und Vorlagen; nötig für die Vorbelegung der Fälligkeit. */
  options?: TaskOptions
}) {
  const [values, setValues] = useState(EMPTY_NEW_TASK_VALUES)
  const [errors, setErrors] = useState<TaskValidationErrors>({})
  const [saving, setSaving] = useState(false)
  /** Fehlercode der API nach einem fehlgeschlagenen Speichern; `null`, wenn es keinen gibt. */
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)
  /** Wahr, sobald die Fälligkeit seit der letzten Vorbelegung von Hand geändert wurde. */
  const dueDateTouched = useRef(false)

  useEffect(() => {
    onSavingChange(saving)
  }, [saving, onSavingChange])
  useEffect(() => () => onSavingChange(false), [onSavingChange])

  // Nach einem fehlgeschlagenen Absenden ins erste fehlerhafte Feld springen.
  useEffect(() => {
    if (focusRequest === 0) return
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus()
  }, [focusRequest, formRef])

  function setField<K extends keyof NewTaskValues>(
    key: K,
    value: NewTaskValues[K]
  ) {
    if (key === "dueDate") dueDateTouched.current = true
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  /** Übernimmt vorbelegte Werte und löscht die Fehler aller geänderten Felder. */
  function replaceValues(next: NewTaskValues) {
    setErrors((current) => {
      const cleared = { ...current }
      for (const key of Object.keys(next) as (keyof NewTaskValues)[]) {
        if (next[key] !== values[key]) delete cleared[key]
      }
      return cleared
    })
    setValues(next)
  }

  function setTemplate(templateId: string) {
    dueDateTouched.current = false
    replaceValues(
      applyTemplate(values, templateId, options, toDayKey(new Date()))
    )
  }

  function setProject(projectId: string) {
    replaceValues(
      applyProject(
        values,
        projectId,
        options,
        dueDateTouched.current,
        toDayKey(new Date())
      )
    )
  }

  function showFieldErrors(fieldErrors: TaskValidationErrors) {
    setErrors(fieldErrors)
    setFocusRequest((request) => request + 1)
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateNewTask(values)
    if (Object.keys(validationErrors).length > 0) {
      showFieldErrors(validationErrors)
      return
    }

    setSubmitError(null)
    setSaving(true)
    const result = await submitNewTask(values)
    setSaving(false)

    if (result.ok) {
      onCreated(result.name)
    } else if (result.error === "invalid_fields" && result.fields) {
      // Lehnt der Server Felder ab, die der Browser durchgelassen hat, erscheinen sie am Feld.
      showFieldErrors(result.fields)
    } else {
      setSubmitError(result.error)
    }
  }

  return {
    values,
    errors,
    saving,
    submitError,
    setField,
    setTemplate,
    setProject,
    submit,
  }
}
