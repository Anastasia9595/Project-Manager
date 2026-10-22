import { Textarea } from "@workspace/ui/components/textarea"

import { FormField, FormGrid } from "@/components/settings/form-field"
import type { CustomerContactFormState } from "@/hooks/use-customer-contact-form"
import {
  getFieldMessage,
  type ContactFormTexts,
} from "@/lib/customer-contact-form/messages"
import { MAX_LENGTH } from "@/lib/customer-contact-form/validation"
import { ContactMethodPicker } from "./contact-method-picker"
import { ContactTextField } from "./contact-text-field"

/** Abschnitt "Kontaktdaten": E-Mail, Telefon, Mobil, bevorzugter Kontaktweg und Notizen. */
export function ContactDetailsFields({
  form,
  t,
}: {
  form: CustomerContactFormState
  t: ContactFormTexts
}) {
  const { values } = form

  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-8">
      <legend className="mb-2 text-base font-semibold">
        {t.contactSection}
      </legend>
      <FormGrid>
        <ContactTextField
          form={form}
          t={t}
          name="email"
          type="email"
          label={t.email}
          maxLength={MAX_LENGTH.email}
        />
        <ContactTextField
          form={form}
          t={t}
          name="phone"
          type="tel"
          label={t.phone}
          maxLength={MAX_LENGTH.phone}
        />
        <ContactTextField
          form={form}
          t={t}
          name="mobile"
          type="tel"
          label={t.mobile}
          maxLength={MAX_LENGTH.phone}
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <ContactMethodPicker
            value={values.preferredContact}
            onChange={(next) => form.setField("preferredContact", next)}
            legend={t.preferredContact}
            hint={t.preferredContactHint}
            clearLabel={t.preferredContactClear}
            labels={t.contactMethods}
          />
        </div>
        <FormField
          label={t.notes}
          error={getFieldMessage(form.errors.notes, "notes", t.validation)}
          className="sm:col-span-2"
        >
          {(id, aria) => (
            <Textarea
              id={id}
              rows={4}
              maxLength={MAX_LENGTH.notes}
              value={values.notes}
              placeholder={t.placeholders.notes}
              aria-invalid={form.errors.notes ? true : undefined}
              {...aria}
              onChange={(event) => form.setField("notes", event.target.value)}
            />
          )}
        </FormField>
      </FormGrid>
    </fieldset>
  )
}
