import { useId } from "react"

import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

/** Barrierefreiheits-Attribute, die das Eingabefeld für Pflichtstatus und Fehlertext übernimmt. */
export type FieldAria = {
  "aria-required"?: true
  "aria-describedby"?: string
}

/**
 * Label mit zugehörigem Eingabefeld; `children` erhält die generierte id und die
 * ARIA-Attribute, die das Feld mit `{...aria}` übernehmen kann.
 */
export function FormField({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string
  /** Markiert das Feld mit einem Stern als Pflichtfeld. */
  required?: boolean
  /** Fehlermeldung, die unter dem Feld erscheint. */
  error?: string
  className?: string
  children: (id: string, aria: FieldAria) => React.ReactNode
}) {
  const id = useId()
  const errorId = `${id}-error`
  const aria: FieldAria = {
    "aria-required": required ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  }
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-destructive">
            *
          </span>
        )}
      </Label>
      {children(id, aria)}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** Zweispaltiges Raster für Formularfelder (einspaltig auf kleinen Bildschirmen). */
export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>
}
