import {
  useEffect,
  useState,
  type RefObject,
  type SubmitEvent,
} from "react"

import {
  EMPTY_CUSTOMER_CONTACT_VALUES,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"
import { submitCustomerContact } from "@/lib/customer-contact-form/submit"
import {
  validateCustomerContact,
  type ContactValidationCode,
} from "@/lib/customer-contact-form/validation"
import { getFullName } from "@/utils/full-name"

export type FieldErrors = Partial<Record<string, ContactValidationCode>>

export type CustomerContactFormState = ReturnType<typeof useCustomerContactForm>

/**
 * Zustand und Ablauf des Formulars "Neuer Kundenkontakt": Werte, Feldfehler, Absenden
 * und der Sprung ins erste fehlerhafte Feld.
 * `formRef` gehört der Komponente (so bleibt der Ref aus dem Rückgabewert heraus) und dient nur
 * dazu, das erste fehlerhafte Feld zu finden. `onSavingChange` meldet, ob gerade gespeichert wird
 * (der Dialog lässt sich dann nicht schließen).
 */
export function useCustomerContactForm({
  formRef,
  onCreated,
  onSavingChange,
}: {
  formRef: RefObject<HTMLFormElement | null>
  /** Wird mit dem vollständigen Namen der neuen Kontaktperson aufgerufen. */
  onCreated: (fullName: string) => void
  onSavingChange: (saving: boolean) => void
}) {
  const [values, setValues] = useState(EMPTY_CUSTOMER_CONTACT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
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

  function setField<K extends keyof CustomerContactValues>(
    key: K,
    value: CustomerContactValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  /** Setzt den Kunden und leert den Standort, weil er zu einem anderen Kunden gehören kann. */
  function setTenant(tenantId: string) {
    setValues((current) => ({ ...current, tenantId, locationId: "" }))
    setErrors((current) => ({ ...current, tenantId: undefined }))
  }

  function showFieldErrors(fieldErrors: FieldErrors) {
    setErrors(fieldErrors)
    setFocusRequest((request) => request + 1)
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateCustomerContact(values)
    if (Object.keys(validationErrors).length > 0) {
      showFieldErrors(validationErrors)
      return
    }

    setSubmitError(null)
    setSaving(true)
    const result = await submitCustomerContact(values)
    setSaving(false)

    if (result.ok) {
      onCreated(getFullName(values.firstName.trim(), values.lastName.trim()))
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
    submit,
  }
}
