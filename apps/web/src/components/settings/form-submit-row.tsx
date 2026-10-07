import { Button } from "@workspace/ui/components/button"

import type { SaveStatus } from "@/hooks/use-save-request"

/** Speichern-Button mit Fehlermeldung daneben; der Erfolg wird per Dialog angezeigt. */
export function FormSubmitRow({
  label,
  status,
  disabled,
  errorLabels,
}: {
  label: string
  status: SaveStatus
  /** Zusätzlich zum Speichern-Zustand, z.B. solange es keine Änderungen gibt. */
  disabled: boolean
  /** Meldung je Fehlercode; `default` gilt für unbekannte Codes. */
  errorLabels: Record<string, string> & { default: string }
}) {
  return (
    <div className="flex items-center gap-4">
      <Button
        type="submit"
        size="lg"
        disabled={disabled || status.state === "saving"}
        className="bg-primary text-white hover:bg-primary/90"
      >
        {label}
      </Button>
      {status.state === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {errorLabels[status.code] ?? errorLabels.default}
        </p>
      )}
    </div>
  )
}
