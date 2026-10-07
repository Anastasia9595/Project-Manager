import { useState, type SubmitEvent } from "react"

import { Separator } from "@workspace/ui/components/separator"
import { Textarea } from "@workspace/ui/components/textarea"

import { SuccessDialog } from "@/components/shared/success-dialog"
import { useFormValues } from "@/hooks/use-form-values"
import { useSaveRequest } from "@/hooks/use-save-request"
import type { Dictionary } from "@/i18n"
import {
  ABOUT_MAX_LENGTH,
  toErrorMessages,
  validateProfile,
} from "@/lib/profile-validation"
import type { ProfileValues } from "@/models/profile"
import { getChangedFields, type ChangedField } from "@/utils/get-changed-fields"
import { ChangedFieldsList } from "./changed-fields-list"
import { FormField, FormGrid } from "./form-field"
import { FormSubmitRow } from "./form-submit-row"
import { SettingsInput } from "./settings-input"
import { SettingsSection } from "./settings-section"

type Dict = Dictionary["settingsPage"]

/** "Grundlegende" und "Weitere Informationen" - werden gemeinsam gespeichert. */
export function ProfileForm({
  initialValues,
  t,
}: {
  initialValues: ProfileValues
  t: Dict
}) {
  const { values, saved, errors, setErrors, bind, isDirty, commit } =
    useFormValues(initialValues)
  const { status, send, setStatus } = useSaveRequest("/api/profile", "PATCH")
  const [savedFields, setSavedFields] = useState<ChangedField[]>([])

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateProfile(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(toErrorMessages(validationErrors, t.validation))
      return
    }

    setSavedFields(
      getChangedFields(saved, values, {
        firstName: t.basic.firstName,
        lastName: t.basic.lastName,
        email: t.basic.email,
        about: t.basic.about,
        phone: t.more.phone,
        position: t.more.position,
        address: t.more.address,
      })
    )
    if (await send(values)) commit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
      <SettingsSection title={t.basic.title} description={t.basic.description}>
        <FormGrid>
          <FormField
            label={t.basic.firstName}
            required
            error={errors.firstName}
          >
            {(id) => <SettingsInput id={id} {...bind("firstName")} />}
          </FormField>
          <FormField label={t.basic.lastName} required error={errors.lastName}>
            {(id) => <SettingsInput id={id} {...bind("lastName")} />}
          </FormField>
          <FormField label={t.basic.email} required error={errors.email}>
            {(id) => <SettingsInput id={id} type="email" {...bind("email")} />}
          </FormField>
          <FormField
            label={t.basic.about}
            error={errors.about}
            className="sm:col-span-2"
          >
            {(id) => (
              <>
                <Textarea
                  id={id}
                  rows={4}
                  maxLength={ABOUT_MAX_LENGTH}
                  placeholder={t.basic.aboutPlaceholder}
                  {...bind("about")}
                />
                <p className="text-right text-xs text-muted-foreground tabular-nums">
                  {values.about.length}/{ABOUT_MAX_LENGTH}
                </p>
              </>
            )}
          </FormField>
        </FormGrid>
      </SettingsSection>

      <Separator />

      <SettingsSection title={t.more.title} description={t.more.description}>
        <FormGrid>
          <FormField label={t.more.phone} error={errors.phone}>
            {(id) => <SettingsInput id={id} type="tel" {...bind("phone")} />}
          </FormField>
          <FormField label={t.more.position}>
            {(id) => <SettingsInput id={id} {...bind("position")} />}
          </FormField>
          <FormField label={t.more.address}>
            {(id) => <SettingsInput id={id} {...bind("address")} />}
          </FormField>
        </FormGrid>
      </SettingsSection>

      <FormSubmitRow
        label={t.save}
        status={status}
        disabled={!isDirty}
        errorLabels={{ default: t.saveError }}
      />

      <SuccessDialog
        open={status.state === "success"}
        onClose={() => setStatus({ state: "idle" })}
        title={t.successDialog.title}
        description={t.successDialog.profileDescription}
        closeLabel={t.successDialog.close}
      >
        <ChangedFieldsList fields={savedFields} />
      </SuccessDialog>
    </form>
  )
}
