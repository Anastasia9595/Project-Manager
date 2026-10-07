import { useId } from "react"

import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

/** Label mit zugehörigem Eingabefeld; `children` erhält die generierte id. */
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
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
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
      {children(id)}
      {error && (
        <p role="alert" className="text-xs text-destructive">
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
