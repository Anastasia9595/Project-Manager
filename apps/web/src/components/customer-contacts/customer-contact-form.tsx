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
import { useSaveRequest } from "@/hooks/use-save-request"
import type { Dictionary } from "@/i18n"
import {
  EMPTY_CUSTOMER_CONTACT_VALUES,
  POSITIONS,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"
import {
  validateCustomerContact,
  type ContactValidationCode,
} from "@/lib/customer-contact-form/validation"
import { getFullName } from "@/utils/full-name"
import { ContactMethodPicker } from "./contact-method-picker"
import { FormSelect } from "./form-select"

type Dict = Dictionary["customerContactsPage"]["form"]
type FieldErrors = Partial<Record<string, ContactValidationCode>>
type OptionsState =
  | { state: "loading" }
  | { state: "error" }
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
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
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
        <CustomerContactFormBody t={t} onCreated={onCreated} />
      </DialogContent>
    </Dialog>
  )
}

function CustomerContactFormBody({
  t,
  onCreated,
}: {
  t: Dict
  onCreated: (fullName: string) => void
}) {
  const [values, setValues] = useState(EMPTY_CUSTOMER_CONTACT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [optionsState, setOptionsState] = useState<OptionsState>({
    state: "loading",
  })
  const [optionsAttempt, setOptionsAttempt] = useState(0)
  const { status, send } = useSaveRequest("/api/customer-contacts", "POST")
  const formRef = useRef<HTMLFormElement>(null)
  const activeLabelId = useId()
  const activeHintId = useId()

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/customer-contacts/options", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("options_failed")
        return response.json() as Promise<ContactOptions>
      })
      .then((options) => setOptionsState({ state: "ready", options }))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") {
          setOptionsState({ state: "error" })
        }
      })
    return () => controller.abort()
  }, [optionsAttempt])

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
    key: "firstName" | "lastName" | "email" | "phone" | "mobile"
  ) {
    return {
      value: values[key],
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
      // Nach dem Rendern ins erste fehlerhafte Feld springen.
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus()
      )
      return
    }

    if (await send(values)) {
      onCreated(getFullName(values.firstName.trim(), values.lastName.trim()))
    }
  }

  const message = (key: string) => {
    const code = errors[key]
    if (!code) return undefined
    if (code === "invalidEmail") return t.validation.invalidEmail
    return t.validation.required[key as keyof Dict["validation"]["required"]]
  }

  if (optionsState.state === "loading") {
    return (
      <p className="px-8 pt-2 pb-8 text-sm text-muted-foreground">
        {t.loading}
      </p>
    )
  }

  if (!options) {
    return (
      <div className="flex flex-col items-start gap-4 px-8 pt-2 pb-8">
        <p role="alert" className="text-sm text-destructive">
          {t.optionsError}
        </p>
        <Button variant="outline" onClick={retryOptions}>
          {t.retry}
        </Button>
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
              {(id) => (
                <SettingsInput
                  id={id}
                  autoFocus
                  {...bindText("firstName")}
                />
              )}
            </FormField>
            <FormField label={t.lastName} required error={message("lastName")}>
              {(id) => <SettingsInput id={id} {...bindText("lastName")} />}
            </FormField>
            <FormField label={t.tenant} required error={message("tenantId")}>
              {(id) => (
                <FormSelect
                  id={id}
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
                    setField(
                      "position",
                      next as CustomerContactValues["position"]
                    )
                  }
                />
              )}
            </FormField>
            <div
              className="flex items-center justify-between gap-4 rounded-2xl border border-input bg-input/30 px-4 py-3 sm:col-span-2"
              onClick={() => setField("isActive", !values.isActive)}
            >
              <div className="flex flex-col gap-1">
                <span id={activeLabelId} className="text-sm font-semibold">
                  {t.isActive}
                </span>
                <span
                  id={activeHintId}
                  className="text-xs text-muted-foreground"
                >
                  {t.isActiveHint}
                </span>
              </div>
              <Switch
                checked={values.isActive}
                onCheckedChange={(checked) => setField("isActive", checked)}
                onClick={(event) => event.stopPropagation()}
                aria-labelledby={activeLabelId}
                aria-describedby={activeHintId}
              />
            </div>
          </FormGrid>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-t border-border pt-8">
          <legend className="mb-2 text-base font-semibold">
            {t.contactSection}
          </legend>
          <FormGrid>
            <FormField label={t.email} error={message("email")}>
              {(id) => (
                <SettingsInput id={id} type="email" {...bindText("email")} />
              )}
            </FormField>
            <FormField label={t.phone}>
              {(id) => (
                <SettingsInput id={id} type="tel" {...bindText("phone")} />
              )}
            </FormField>
            <FormField label={t.mobile} className="sm:col-span-2">
              {(id) => (
                <SettingsInput id={id} type="tel" {...bindText("mobile")} />
              )}
            </FormField>
            <div className="sm:col-span-2">
              <ContactMethodPicker
                value={values.preferredContact}
                onChange={(next) => setField("preferredContact", next)}
                legend={t.preferredContact}
                hint={t.preferredContactHint}
                labels={t.contactMethods}
              />
            </div>
            <FormField label={t.notes} className="sm:col-span-2">
              {(id) => (
                <Textarea
                  id={id}
                  rows={4}
                  value={values.notes}
                  placeholder={t.placeholders.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                />
              )}
            </FormField>
          </FormGrid>
        </fieldset>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-8 py-4">
        {status.state === "error" && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {t.saveError}
          </p>
        )}
        <DialogClose render={<Button type="button" variant="outline" size="lg" />}>
          {t.cancel}
        </DialogClose>
        <Button
          type="submit"
          size="lg"
          disabled={status.state === "saving"}
          className="bg-primary text-white hover:bg-primary/90"
        >
          {status.state === "saving" ? t.saving : t.save}
        </Button>
      </div>
    </form>
  )
}
