import type { SubmitEvent } from "react"

import { SuccessDialog } from "@/components/shared/success-dialog"
import { useFormValues } from "@/hooks/use-form-values"
import { useSaveRequest } from "@/hooks/use-save-request"
import type { Dictionary } from "@/i18n"
import {
  toErrorMessages,
  validatePasswordChange,
} from "@/lib/profile-validation"
import { FormField, FormGrid } from "./form-field"
import { FormSubmitRow } from "./form-submit-row"
import { SettingsInput } from "./settings-input"
import { SettingsSection } from "./settings-section"

type Dict = Dictionary["settingsPage"]

const EMPTY = { current: "", next: "", confirm: "" }

export function PasswordSection({ t }: { t: Dict }) {
  const { values, errors, setErrors, bind, reset } = useFormValues(EMPTY)
  const { status, send, setStatus } = useSaveRequest(
    "/api/profile/password",
    "POST"
  )

  const passwordProps = (key: keyof typeof EMPTY) => ({
    ...bind(key),
    type: "password",
    autoComplete: key === "current" ? "current-password" : "new-password",
  })

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validatePasswordChange(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(toErrorMessages(validationErrors, t.validation))
      return
    }

    const ok = await send({
      currentPassword: values.current,
      newPassword: values.next,
    })
    if (ok) reset()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SettingsSection
        title={t.password.title}
        description={t.password.description}
      >
        <FormGrid>
          <FormField label={t.password.current} required>
            {(id) => <SettingsInput id={id} {...passwordProps("current")} />}
          </FormField>
          <div className="hidden sm:block" />
          <FormField label={t.password.new} required error={errors.next}>
            {(id) => <SettingsInput id={id} {...passwordProps("next")} />}
          </FormField>
          <FormField label={t.password.confirm} required error={errors.confirm}>
            {(id) => <SettingsInput id={id} {...passwordProps("confirm")} />}
          </FormField>
        </FormGrid>
        <FormSubmitRow
          label={t.password.submit}
          status={status}
          disabled={!values.current || !values.next || !values.confirm}
          errorLabels={{
            default: t.password.rejected,
            invalid_current: t.password.invalidCurrent,
            rejected: t.password.rejected,
          }}
        />
      </SettingsSection>

      <SuccessDialog
        open={status.state === "success"}
        onClose={() => setStatus({ state: "idle" })}
        title={t.successDialog.title}
        description={t.successDialog.passwordDescription}
        closeLabel={t.successDialog.close}
      />
    </form>
  )
}
