import { Button } from "@workspace/ui/components/button"
import { DialogClose } from "@workspace/ui/components/dialog"

/** Fußzeile der Formular-Dialoge: Fehlermeldung zum Speichern, Abbrechen und Anlegen. */
export function FormDialogFooter({
  saving,
  errorMessage,
  texts,
}: {
  saving: boolean
  /** Fertige Meldung nach einem fehlgeschlagenen Speichern. */
  errorMessage: string | null
  texts: { cancel: string; saving: string; save: string }
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-3 border-t border-border px-8 py-4">
      {errorMessage && (
        <p role="alert" className="mr-auto text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      <DialogClose
        render={
          <Button type="button" variant="outline" size="lg" disabled={saving} />
        }
      >
        {texts.cancel}
      </DialogClose>
      <Button
        type="submit"
        size="lg"
        disabled={saving}
        className="bg-primary text-white hover:bg-primary/90"
      >
        {saving ? texts.saving : texts.save}
      </Button>
    </div>
  )
}
