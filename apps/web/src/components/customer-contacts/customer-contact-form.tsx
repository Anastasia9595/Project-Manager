import { useEffect, useMemo, useState, type SubmitEvent } from "react"

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
  CONTACT_METHODS,
  EMPTY_CUSTOMER_CONTACT_VALUES,
  POSITIONS,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"
import {
  validateCustomerContact,
  type ContactValidationCode,
} from "@/lib/customer-contact-form/validation"
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
  onCreated: () => void
  t: Dict
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        closeLabel={t.close}
        className="max-h-[90vh] max-w-2xl overflow-y-auto text-left"
      >
        <DialogTitle>{t.title}</DialogTitle>
        <DialogDescription className="mt-2">{t.description}</DialogDescription>
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
  onCreated: () => void
}) {
  const [values, setValues] = useState(EMPTY_CUSTOMER_CONTACT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [optionsState, setOptionsState] = useState<OptionsState>({
    state: "loading",
  })
  const [optionsAttempt, setOptionsAttempt] = useState(0)
  const { status, send } = useSaveRequest("/api/customer-contacts", "POST")

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
  const locations = useMemo(
    () =>
      options?.locations.filter(
        (location) => location.tenant === values.tenantId
      ) ?? [],
    [options, values.tenantId]
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

  function bindText(key: "firstName" | "lastName" | "email" | "phone" | "mobile") {
    return {
      value: values[key],
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
      return
    }

    if (await send(values)) onCreated()
  }

  const message = (key: string) => {
    const code = errors[key]
    return code ? t.validation[code] : undefined
  }

  if (optionsState.state === "loading") {
    return <p className="mt-6 text-sm text-muted-foreground">{t.loading}</p>
  }

  if (!options) {
    return (
      <div className="mt-6 flex items-center gap-4">
        <p role="alert" className="text-sm text-destructive">
          {t.optionsError}
        </p>
        <Button variant="outline" onClick={retryOptions}>
          {t.retry}
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 flex flex-col gap-8"
    >
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-base font-semibold">
          {t.personSection}
        </legend>
        <FormGrid>
          <FormField label={t.firstName} required error={message("firstName")}>
            {(id) => <SettingsInput id={id} {...bindText("firstName")} />}
          </FormField>
          <FormField label={t.lastName} required error={message("lastName")}>
            {(id) => <SettingsInput id={id} {...bindText("lastName")} />}
          </FormField>
          <FormField label={t.tenant} required error={message("tenantId")}>
            {(id) => (
              <FormSelect
                id={id}
                value={values.tenantId}
                aria-invalid={errors.tenantId ? true : undefined}
                onChange={(event) => {
                  setField("tenantId", event.target.value)
                  setField("locationId", "")
                }}
              >
                <option value="">{t.noSelection}</option>
                {options.tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </FormSelect>
            )}
          </FormField>
          <FormField label={t.location}>
            {(id) => (
              <FormSelect
                id={id}
                value={values.locationId}
                disabled={!values.tenantId}
                onChange={(event) => setField("locationId", event.target.value)}
              >
                <option value="">{t.noLocation}</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </FormSelect>
            )}
          </FormField>
          <FormField label={t.position}>
            {(id) => (
              <FormSelect
                id={id}
                value={values.position}
                onChange={(event) =>
                  setField(
                    "position",
                    event.target.value as CustomerContactValues["position"]
                  )
                }
              >
                <option value="">{t.noSelection}</option>
                {POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {t.positions[position]}
                  </option>
                ))}
              </FormSelect>
            )}
          </FormField>
          <FormField label={t.isActive}>
            {(id) => (
              <Switch
                id={id}
                checked={values.isActive}
                onCheckedChange={(checked) => setField("isActive", checked)}
              />
            )}
          </FormField>
        </FormGrid>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
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
            {(id) => <SettingsInput id={id} type="tel" {...bindText("phone")} />}
          </FormField>
          <FormField label={t.mobile}>
            {(id) => <SettingsInput id={id} type="tel" {...bindText("mobile")} />}
          </FormField>
          <FormField label={t.preferredContact}>
            {(id) => (
              <FormSelect
                id={id}
                value={values.preferredContact}
                onChange={(event) =>
                  setField(
                    "preferredContact",
                    event.target.value as CustomerContactValues["preferredContact"]
                  )
                }
              >
                <option value="">{t.noSelection}</option>
                {CONTACT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {t.contactMethods[method]}
                  </option>
                ))}
              </FormSelect>
            )}
          </FormField>
          <FormField label={t.notes} className="sm:col-span-2">
            {(id) => (
              <Textarea
                id={id}
                rows={4}
                value={values.notes}
                onChange={(event) => setField("notes", event.target.value)}
              />
            )}
          </FormField>
        </FormGrid>
      </fieldset>

      <div className="flex items-center justify-end gap-3">
        {status.state === "error" && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {t.saveError}
          </p>
        )}
        <DialogClose render={<Button type="button" variant="outline" />}>
          {t.cancel}
        </DialogClose>
        <Button
          type="submit"
          size="lg"
          disabled={status.state === "saving"}
          className="bg-primary text-white hover:bg-primary/90"
        >
          {t.save}
        </Button>
      </div>
    </form>
  )
}
