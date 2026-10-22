import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"

import { FormField, FormGrid } from "@/components/settings/form-field"
import { SettingsInput } from "@/components/settings/settings-input"
import type { Dictionary } from "@/i18n"
import {
  EMPTY_CUSTOMER_CONTACT_VALUES,
  POSITIONS,
  isPosition,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"
import { submitCustomerContact } from "@/lib/customer-contact-form/submit"
import {
  MAX_LENGTH,
  type ContactValidationCode,
  validateCustomerContact,
} from "@/lib/customer-contact-form/validation"
import { getFullName } from "@/utils/full-name"
import { ContactMethodPicker } from "./contact-method-picker"
import { FormSelect } from "./form-select"

type Dict = Dictionary["customerContactsPage"]["form"]
type RequiredField = keyof Dict["validation"]["required"]
type FieldErrors = Partial<Record<string, ContactValidationCode>>
type OptionsState =
  | { state: "loading" }
  | { state: "error"; forbidden: boolean }
  | { state: "ready"; options: ContactOptions }

/** Dialog zum Anlegen einer Kontaktperson (Directus: tenant_users). */
export function CustomerContactForm({
  open,
  onClose,
  onCreated,
  t,
}: {
  open: boolean
  onClose: () => void
  /** Wird mit dem vollständigen Namen der neuen Kontaktperson aufgerufen. */
  onCreated: (fullName: string) => void
  t: Dict
}) {
  const [saving, setSaving] = useState(false)

  return (
    // Während des Speicherns lässt sich der Dialog nicht schließen, damit kein Kontakt doppelt entsteht.
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <DialogContent
        closeLabel={t.close}
        className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 text-left"
      >
        <div className="px-8 pt-8 pb-4">
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription className="mt-2">
            {t.description}
          </DialogDescription>
        </div>
        {/* Wird nur bei geöffnetem Dialog gerendert, startet also bei jedem Öffnen leer. */}
        <CustomerContactFormBody
          t={t}
          onCreated={onCreated}
          onSavingChange={setSaving}
        />
      </DialogContent>
    </Dialog>
  )
}

function CustomerContactFormBody({
  t,
  onCreated,
  onSavingChange,
}: {
  t: Dict
  onCreated: (fullName: string) => void
  onSavingChange: (saving: boolean) => void
}) {
  const [values, setValues] = useState(EMPTY_CUSTOMER_CONTACT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [optionsState, setOptionsState] = useState<OptionsState>({
    state: "loading",
  })
  const [optionsAttempt, setOptionsAttempt] = useState(0)
  const [focusRequest, setFocusRequest] = useState(0)
  const [saving, setSaving] = useState(false)
  /** Fehlercode der API nach einem fehlgeschlagenen Speichern; `null`, wenn es keinen gibt. */
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const activeLabelId = useId()
  const activeHintId = useId()

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/customer-contacts/options", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 403) {
          setOptionsState({ state: "error", forbidden: true })
          return
        }
        if (!response.ok) throw new Error("options_failed")
        const options = (await response.json()) as ContactOptions
        setOptionsState({ state: "ready", options })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setOptionsState({ state: "error", forbidden: false })
      })
    return () => controller.abort()
  }, [optionsAttempt])

  // Meldet dem Dialog, ob gerade gespeichert wird (sperrt das Schließen).
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
  }, [focusRequest])

  const options = optionsState.state === "ready" ? optionsState.options : null

  const tenantOptions = useMemo(
    () =>
      options?.tenants.map((tenant) => ({
        value: tenant.id,
        label: tenant.name,
      })) ?? [],
    [options]
  )
  const locationOptions = useMemo(
    () =>
      options?.locations
        .filter((location) => location.tenant === values.tenantId)
        .map((location) => ({ value: location.id, label: location.name })) ??
      [],
    [options, values.tenantId]
  )
  const positionOptions = useMemo(
    () =>
      POSITIONS.map((position) => ({
        value: position,
        label: t.positions[position],
      })),
    [t]
  )

  function retryOptions() {
    setOptionsState({ state: "loading" })
    setOptionsAttempt((attempt) => attempt + 1)
  }

  function setField<K extends keyof CustomerContactValues>(
    key: K,
    value: CustomerContactValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function bindText(
    key: "firstName" | "lastName" | "email" | "phone" | "mobile",
    maxLength: number
  ) {
    return {
      value: values[key],
      maxLength,
      autoComplete: "off",
      placeholder: t.placeholders[key],
      "aria-invalid": errors[key] ? true : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setField(key, event.target.value),
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateCustomerContact(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setFocusRequest((request) => request + 1)
      return
    }

    setSubmitError(null)
    setSaving(true)
    const result = await submitCustomerContact(values)
    setSaving(false)

    if (result.ok) {
      onCreated(getFullName(values.firstName.trim(), values.lastName.trim()))
      return
    }
    // Lehnt der Server Felder ab, die der Browser durchgelassen hat, erscheinen sie am Feld.
    if (result.error === "invalid_fields" && result.fields) {
      setErrors(result.fields)
      setFocusRequest((request) => request + 1)
      return
    }
    setSubmitError(result.error)
  }

  const submitErrorMessage = (code: string) => {
    switch (code) {
      case "unauthorized":
        return t.sessionExpired
      case "forbidden":
        return t.forbidden
      case "invalid_location":
        return t.invalidLocation
      default:
        return t.saveError
    }
  }

  const isRequiredField = (key: string): key is RequiredField =>
    key in t.validation.required

  const message = (key: RequiredField | "email" | "phone" | "mobile" | "notes") => {
    const code = errors[key]
    if (!code) return undefined
    if (code === "invalidEmail") return t.validation.invalidEmail
    if (code === "invalidPhone") return t.validation.invalidPhone
    if (code === "tooLong") return t.validation.tooLong
    return isRequiredField(key) ? t.validation.required[key] : undefined
  }

  if (optionsState.state === "loading") {
    return (
      <p
        role="status"
        className="px-8 pt-2 pb-8 text-sm text-muted-foreground"
      >
        {t.loading}
      </p>
    )
  }

  if (!options) {
    const forbidden = optionsState.state === "error" && optionsState.forbidden
    return (
      <div className="flex flex-col items-start gap-4 px-8 pt-2 pb-8">
        <p role="alert" className="text-sm text-destructive">
          {forbidden ? t.forbidden : t.optionsError}
        </p>
        {!forbidden && (
          <Button variant="outline" onClick={retryOptions}>
            {t.retry}
          </Button>
        )}
      </div>
    )
  }

  const locationPlaceholder = !values.tenantId
    ? t.placeholders.locationNeedsTenant
    : locationOptions.length === 0
      ? t.placeholders.locationNone
      : t.placeholders.location

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex flex-col gap-8 overflow-y-auto px-8 py-2">
        <p className="text-xs text-muted-foreground">{t.requiredNote}</p>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-base font-semibold">
            {t.personSection}
          </legend>
          <FormGrid>
            <FormField
              label={t.firstName}
              required
              error={message("firstName")}
            >
              {(id, aria) => (
                <SettingsInput
                  id={id}
                  autoFocus
                  {...aria}
                  {...bindText("firstName", MAX_LENGTH.name)}
                />
              )}
            </FormField>
            <FormField label={t.lastName} required error={message("lastName")}>
              {(id, aria) => (
                <SettingsInput
                  id={id}
                  {...aria}
                  {...bindText("lastName", MAX_LENGTH.name)}
                />
              )}
            </FormField>
            <FormField label={t.tenant} required error={message("tenantId")}>
              {(id, aria) => (
                <FormSelect
                  id={id}
                  aria={aria}
                  value={values.tenantId}
                  invalid={!!errors.tenantId}
                  options={tenantOptions}
                  placeholder={t.placeholders.tenant}
                  onValueChange={(next) => {
                    setValues((current) => ({
                      ...current,
                      tenantId: next,
                      locationId: "",
                    }))
                    setErrors((current) => ({ ...current, tenantId: undefined }))
                  }}
                />
              )}
            </FormField>
            <FormField label={t.location}>
              {(id) => (
                <FormSelect
                  id={id}
                  value={values.locationId}
                  options={locationOptions}
                  placeholder={locationPlaceholder}
                  emptyLabel={t.placeholders.locationEmpty}
                  disabled={locationOptions.length === 0}
                  onValueChange={(next) => setField("locationId", next)}
                />
              )}
            </FormField>
            <FormField label={t.position} className="sm:col-span-2">
              {(id) => (
                <FormSelect
                  id={id}
                  value={values.position}
                  options={positionOptions}
                  placeholder={t.placeholders.position}
                  emptyLabel={t.placeholders.positionEmpty}
                  onValueChange={(next) =>
                    setField("position", isPosition(next) ? next : "")
                  }
                />
              )}
            </FormField>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-input bg-input/30 px-4 py-3 sm:col-span-2">
              <span className="flex flex-col gap-1">
                <span id={activeLabelId} className="text-sm font-semibold">
                  {t.isActive}
                </span>
                <span
                  id={activeHintId}
                  className="text-xs text-muted-foreground"
                >
                  {t.isActiveHint}
                </span>
              </span>
              <Switch
                checked={values.isActive}
                onCheckedChange={(checked) => setField("isActive", checked)}
                aria-labelledby={activeLabelId}
                aria-describedby={activeHintId}
              />
            </label>
          </FormGrid>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-t border-border pt-8">
          <legend className="mb-2 text-base font-semibold">
            {t.contactSection}
          </legend>
          <FormGrid>
            <FormField label={t.email} error={message("email")}>
              {(id, aria) => (
                <SettingsInput
                  id={id}
                  type="email"
                  {...aria}
                  {...bindText("email", MAX_LENGTH.email)}
                />
              )}
            </FormField>
            <FormField label={t.phone} error={message("phone")}>
              {(id, aria) => (
                <SettingsInput
                  id={id}
                  type="tel"
                  {...aria}
                  {...bindText("phone", MAX_LENGTH.phone)}
                />
              )}
            </FormField>
            <FormField
              label={t.mobile}
              error={message("mobile")}
              className="sm:col-span-2"
            >
              {(id, aria) => (
                <SettingsInput
                  id={id}
                  type="tel"
                  {...aria}
                  {...bindText("mobile", MAX_LENGTH.phone)}
                />
              )}
            </FormField>
            <div className="sm:col-span-2">
              <ContactMethodPicker
                value={values.preferredContact}
                onChange={(next) => setField("preferredContact", next)}
                legend={t.preferredContact}
                hint={t.preferredContactHint}
                clearLabel={t.preferredContactClear}
                labels={t.contactMethods}
              />
            </div>
            <FormField
              label={t.notes}
              error={message("notes")}
              className="sm:col-span-2"
            >
              {(id, aria) => (
                <Textarea
                  id={id}
                  rows={4}
                  maxLength={MAX_LENGTH.notes}
                  value={values.notes}
                  placeholder={t.placeholders.notes}
                  aria-invalid={errors.notes ? true : undefined}
                  {...aria}
                  onChange={(event) => setField("notes", event.target.value)}
                />
              )}
            </FormField>
          </FormGrid>
        </fieldset>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-8 py-4">
        {submitError && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {submitErrorMessage(submitError)}
          </p>
        )}
        <DialogClose
          render={
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={saving}
            />
          }
        >
          {t.cancel}
        </DialogClose>
        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className="bg-primary text-white hover:bg-primary/90"
        >
          {saving ? t.saving : t.save}
        </Button>
      </div>
    </form>
  )
}
