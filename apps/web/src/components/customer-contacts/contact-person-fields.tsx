import { useMemo } from "react"

import { FormField, FormGrid } from "@/components/settings/form-field"
import type { CustomerContactFormState } from "@/hooks/use-customer-contact-form"
import { isPosition } from "@/lib/customer-contact-form/fields"
import {
  getFieldMessage,
  type ContactFormTexts,
} from "@/lib/customer-contact-form/messages"
import {
  getLocationPlaceholder,
  toLocationOptions,
  toPositionOptions,
  toTenantOptions,
} from "@/lib/customer-contact-form/options"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"
import { MAX_LENGTH } from "@/lib/customer-contact-form/validation"
import { ActiveToggle } from "./active-toggle"
import { ContactTextField } from "./contact-text-field"
import { FormSelect } from "./form-select"

/** Abschnitt "Person": Name, Kunde, Standort, Position und Aktiv-Schalter. */
export function ContactPersonFields({
  form,
  options,
  t,
}: {
  form: CustomerContactFormState
  options: ContactOptions
  t: ContactFormTexts
}) {
  const { values } = form
  const tenantOptions = useMemo(() => toTenantOptions(options), [options])
  const locationOptions = useMemo(
    () => toLocationOptions(options, values.tenantId),
    [options, values.tenantId]
  )
  const positionOptions = useMemo(
    () => toPositionOptions(t.positions),
    [t.positions]
  )

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 text-base font-semibold">
        {t.personSection}
      </legend>
      <FormGrid>
        <ContactTextField
          form={form}
          t={t}
          name="firstName"
          label={t.firstName}
          maxLength={MAX_LENGTH.name}
          required
          autoFocus
        />
        <ContactTextField
          form={form}
          t={t}
          name="lastName"
          label={t.lastName}
          maxLength={MAX_LENGTH.name}
          required
        />
        <FormField
          label={t.tenant}
          required
          error={getFieldMessage(form.errors.tenantId, "tenantId", t.validation)}
        >
          {(id, aria) => (
            <FormSelect
              id={id}
              aria={aria}
              value={values.tenantId}
              invalid={!!form.errors.tenantId}
              options={tenantOptions}
              placeholder={t.placeholders.tenant}
              onValueChange={form.setTenant}
            />
          )}
        </FormField>
        <FormField label={t.location}>
          {(id) => (
            <FormSelect
              id={id}
              value={values.locationId}
              options={locationOptions}
              placeholder={getLocationPlaceholder(
                values.tenantId,
                locationOptions.length,
                t.placeholders
              )}
              emptyLabel={t.placeholders.locationEmpty}
              disabled={locationOptions.length === 0}
              onValueChange={(next) => form.setField("locationId", next)}
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
                form.setField("position", isPosition(next) ? next : "")
              }
            />
          )}
        </FormField>
        <ActiveToggle
          checked={values.isActive}
          onCheckedChange={(checked) => form.setField("isActive", checked)}
          label={t.isActive}
          hint={t.isActiveHint}
          className="sm:col-span-2"
        />
      </FormGrid>
    </fieldset>
  )
}
