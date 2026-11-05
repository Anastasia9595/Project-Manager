import { useRef, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useNewTaskForm } from "@/hooks/use-new-task-form"
import { useTaskOptions } from "@/hooks/use-task-options"
import type { TaskFormTexts } from "./form-helpers"
import { TaskFields } from "./task-fields"
import { TaskFormFooter } from "./task-form-footer"

/** Dialog zum Anlegen einer Aufgabe (Directus: tasks), frei oder aus einer Vorlage. */
export function NewTaskForm({
  open,
  onClose,
  onCreated,
  t,
}: {
  open: boolean
  onClose: () => void
  /** Wird mit dem Namen der neuen Aufgabe aufgerufen. */
  onCreated: (name: string) => void
  t: TaskFormTexts
}) {
  const [saving, setSaving] = useState(false)

  return (
    // Während des Speicherns lässt sich der Dialog nicht schließen, damit keine Aufgabe doppelt entsteht.
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
        <NewTaskFormBody
          t={t}
          onCreated={onCreated}
          onSavingChange={setSaving}
        />
      </DialogContent>
    </Dialog>
  )
}

function NewTaskFormBody({
  t,
  onCreated,
  onSavingChange,
}: {
  t: TaskFormTexts
  onCreated: (name: string) => void
  onSavingChange: (saving: boolean) => void
}) {
  const { state: optionsState, retry } = useTaskOptions()
  const formRef = useRef<HTMLFormElement>(null)
  const form = useNewTaskForm({
    formRef,
    onCreated,
    onSavingChange,
    options: optionsState.state === "ready" ? optionsState.options : undefined,
  })

  if (optionsState.state === "loading") {
    return (
      <p role="status" className="px-8 pt-2 pb-8 text-sm text-muted-foreground">
        {t.loading}
      </p>
    )
  }

  if (optionsState.state === "error") {
    return (
      <div className="flex flex-col items-start gap-4 px-8 pt-2 pb-8">
        <p role="alert" className="text-sm text-destructive">
          {optionsState.forbidden ? t.errors.forbidden : t.optionsError}
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
        <TaskFields form={form} options={optionsState.options} t={t} />
      </div>
      <TaskFormFooter
        t={t}
        saving={form.saving}
        submitError={form.submitError}
      />
    </form>
  )
}
