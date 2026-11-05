import { useEffect, useState, type RefObject, type SubmitEvent } from "react"

import { toDayKey } from "@/lib/week"
import { submitNewProject } from "@/services/projects/projects.client"
import {
  validateNewProject,
  type ProjectValidationErrors,
} from "@/services/projects/new-project.validation"
import {
  EMPTY_NEW_PROJECT_VALUES,
  type NewProjectValues,
} from "@/services/projects/new-project.values"

export type NewProjectFormState = ReturnType<typeof useNewProjectForm>

/**
 * Zustand und Ablauf des Formulars "Neues Projekt" (wie `useCustomerContactForm`): Werte,
 * Feldfehler, Absenden und der Sprung ins erste fehlerhafte Feld.
 */
export function useNewProjectForm({
  formRef,
  onCreated,
  onSavingChange,
}: {
  formRef: RefObject<HTMLFormElement | null>
  /** Wird mit dem Namen des neuen Projekts aufgerufen. */
  onCreated: (name: string) => void
  onSavingChange: (saving: boolean) => void
}) {
  const [values, setValues] = useState(EMPTY_NEW_PROJECT_VALUES)
  const [errors, setErrors] = useState<ProjectValidationErrors>({})
  const [saving, setSaving] = useState(false)
  /** Fehlercode der API nach einem fehlgeschlagenen Speichern; `null`, wenn es keinen gibt. */
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)

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

  function setField<K extends keyof NewProjectValues>(
    key: K,
    value: NewProjectValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  /** Setzt den Kunden und leert die Kontaktperson, weil sie zu einem anderen Kunden gehören kann. */
  function setTenant(tenantId: string) {
    setValues((current) => ({ ...current, tenantId, tenantUserId: "" }))
    setErrors((current) => ({
      ...current,
      tenantId: undefined,
      tenantUserId: undefined,
    }))
  }

  /** Setzt den Medientyp und leert die Variante, weil sie zu einem anderen Medientyp gehören kann. */
  function setMediaType(mediaTypeId: string) {
    setValues((current) => ({ ...current, mediaTypeId, variantId: "" }))
    setErrors((current) => ({
      ...current,
      mediaTypeId: undefined,
      variantId: undefined,
    }))
  }

  function showFieldErrors(fieldErrors: ProjectValidationErrors) {
    setErrors(fieldErrors)
    setFocusRequest((request) => request + 1)
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateNewProject(values, toDayKey(new Date()))
    if (Object.keys(validationErrors).length > 0) {
      showFieldErrors(validationErrors)
      return
    }

    setSubmitError(null)
    setSaving(true)
    const result = await submitNewProject(values)
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
    setTenant,
    setMediaType,
    submit,
  }
}
