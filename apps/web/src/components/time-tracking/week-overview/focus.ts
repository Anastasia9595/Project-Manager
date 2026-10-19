import { toDayKey } from "@/lib/week"

export const OVERVIEW_HEADING_ID = "week-overview-title"
export const POPOVER_CLOSE_BUTTON_ID = "cell-popover-close"

export function deleteButtonId(entry: { id: string }): string {
  return `delete-entry-${entry.id}`
}

export function focusById(id: string): void {
  document.getElementById(id)?.focus()
}

/** Stabile ID einer Tageszelle – bleibt gleich, ob die Zelle gefüllt oder leer ist. */
export function cellButtonId(taskId: string, date: Date): string {
  return `cell-${taskId}-${toDayKey(date)}`
}

/**
 * Fokussiert nach dem nächsten Rendern das erste vorhandene Element, z.B. die
 * Zelle und – falls deren Zeile verschwunden ist – die Überschrift der Übersicht.
 */
export function focusFirstAfterRender(ids: string[]): void {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const target = ids
        .map((id) => document.getElementById(id))
        .find((element) => element !== null)
      target?.focus()
    })
  )
}
