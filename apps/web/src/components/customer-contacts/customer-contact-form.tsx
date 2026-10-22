import { useRef, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useContactOptions } from "@/hooks/use-contact-options"
import { useCustomerContactForm } from "@/hooks/use-customer-contact-form"
import type { ContactFormTexts } from "@/lib/customer-contact-form/messages"
import { ContactDetailsFields } from "./contact-details-fields"
import { ContactFormFooter } from "./contact-form-footer"
import { ContactPersonFields } from "./contact-person-fields"

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
  t: ContactFormTexts
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
  t: ContactFormTexts
  onCreated: (fullName: string) => void
  onSavingChange: (saving: boolean) => void
}) {
  const { state: optionsState, retry } = useContactOptions()
  const formRef = useRef<HTMLFormElement>(null)
  const form = useCustomerContactForm({ formRef, onCreated, onSavingChange })

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

  if (optionsState.state === "error") {
    return (
      <div className="flex flex-col items-start gap-4 px-8 pt-2 pb-8">
        <p role="alert" className="text-sm text-destructive">
          {optionsState.forbidden ? t.forbidden : t.optionsError}
        </p>
        {!optionsState.forbidden && (
          <Button variant="outline" onClick={retry}>
            {t.retry}
          </Button>
        )}
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={form.submit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex flex-col gap-8 overflow-y-auto px-8 py-2">
        <p className="text-xs text-muted-foreground">{t.requiredNote}</p>
        <ContactPersonFields
          form={form}
          options={optionsState.options}
          t={t}
        />
        <ContactDetailsFields form={form} t={t} />
      </div>
      <ContactFormFooter
        t={t}
        saving={form.saving}
        submitError={form.submitError}
      />
    </form>
  )
}
