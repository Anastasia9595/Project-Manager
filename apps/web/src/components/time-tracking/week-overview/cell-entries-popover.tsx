import { useState } from "react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"
import {
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@workspace/ui/components/popover"

import { IconButton } from "@/components/shared/icon-button"
import { DeleteConfirmation } from "@/components/time-tracking/week-overview/delete-confirmation"
import { EntryRow } from "@/components/time-tracking/week-overview/entry-row"
import {
  POPOVER_CLOSE_BUTTON_ID,
  deleteButtonId,
  focusById,
} from "@/components/time-tracking/week-overview/focus"
import type { PopoverLabels } from "@/components/time-tracking/week-overview/types"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import { sumMinutes } from "@/lib/time-tracking/calculations/totals"
import type { TimeBooking } from "@/models/time-booking"
import { fillTemplate } from "@/utils/fill-template"

/** Inhalt des Popovers einer Zelle: Einzeleinträge mit Bearbeiten/Löschen. */
export function CellEntriesPopover({
  title,
  projectTitle,
  entries,
  labels,
  onClose,
  onEmptied,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string
  projectTitle: string
  entries: TimeBooking[]
  labels: PopoverLabels
  onClose: () => void
  /** Der letzte Eintrag wurde gelöscht – die Zelle ist jetzt leer. */
  onEmptied: () => void
  onAdd: () => void
  onEdit: (entry: TimeBooking) => void
  onDelete: (entry: TimeBooking) => Promise<boolean>
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  function keep(entry: TimeBooking) {
    setConfirmingId(null)
    requestAnimationFrame(() => focusById(deleteButtonId(entry)))
  }

  async function confirmDelete(entry: TimeBooking) {
    const wasLastEntry = entries.length === 1
    setConfirmingId(null)
    const deleted = await onDelete(entry)
    // Fehlgeschlagen: Eintrag steht noch da – Fokus zurück auf seinen Löschen-Button.
    if (!deleted) focusById(deleteButtonId(entry))
    else if (wasLastEntry) onEmptied()
    else focusById(POPOVER_CLOSE_BUTTON_ID)
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2 border-b border-border p-4">
        <PopoverHeader>
          <PopoverTitle className="font-semibold">{title}</PopoverTitle>
          <PopoverDescription className="text-xs">{projectTitle}</PopoverDescription>
        </PopoverHeader>
        <IconButton
          id={POPOVER_CLOSE_BUTTON_ID}
          icon={Cancel01Icon}
          label={labels.close}
          size="icon-xs"
          onClick={onClose}
        />
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {entries.map((entry) => (
          <li key={entry.id} className="p-4">
            {confirmingId === entry.id ? (
              <DeleteConfirmation
                entry={entry}
                labels={labels}
                onConfirm={() => void confirmDelete(entry)}
                onKeep={() => keep(entry)}
              />
            ) : (
              <EntryRow
                entry={entry}
                labels={labels}
                onEdit={() => onEdit(entry)}
                onRequestDelete={() => setConfirmingId(entry.id)}
              />
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2 border-t border-border p-4">
        <span className="text-sm font-medium text-foreground tabular-nums">
          {fillTemplate(labels.total, {
            duration: formatDuration(sumMinutes(entries)),
          })}
        </span>
        <Button variant="link" size="xs" className="text-due-today" onClick={onAdd}>
          <span aria-hidden>+</span>
          {labels.add}
        </Button>
      </div>
    </>
  )
}
