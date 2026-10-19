import type { ReactNode } from "react"

import type { Dictionary } from "@/i18n"

export type FormLabels = Dictionary["timeTrackingPage"]["form"]

/** Stern für Pflichtfelder; Screenreader hören stattdessen „(Pflichtfeld)“. */
export function RequiredMark({ label }: { label: string }) {
  return (
    <>
      <span aria-hidden> *</span>
      <span className="sr-only"> ({label})</span>
    </>
  )
}

/** Label, Eingabe und Meldungen eines Felds untereinander. */
export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>
}

/** Gruppe zusammengehöriger Eingaben mit Überschrift (`legend`). */
export function FieldSet({
  legend,
  describedBy,
  children,
}: {
  legend: ReactNode
  describedBy?: string
  children: ReactNode
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2" aria-describedby={describedBy}>
      <legend className="mb-2 text-sm font-medium text-foreground">{legend}</legend>
      {children}
    </fieldset>
  )
}
