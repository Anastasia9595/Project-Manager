import { Button } from "@workspace/ui/components/button"

import type { PopoverLabels } from "@/components/time-tracking/week-overview/types"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import type { TimeBooking } from "@/models/time-booking"
import { fillTemplate } from "@/utils/fill-template"

/** Inline-Bestätigung „0:40 h-Eintrag löschen?“ mit „Löschen“ / „Behalten“. */
export function DeleteConfirmation({
  entry,
  labels,
  onConfirm,
  onKeep,
}: {
  entry: TimeBooking
  labels: PopoverLabels
  onConfirm: () => void
  onKeep: () => void
}) {
  return (
    <div className="-m-4 flex flex-col gap-3 bg-destructive-tint p-4">
      <p className="font-semibold text-destructive-dark">
        {fillTemplate(labels.confirmDelete, {
          duration: formatDuration(entry.duration_minutes),
        })}
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={onConfirm}
        >
          {labels.confirm}
        </Button>
        {/* Fokus auf „Behalten“: Enter löscht nicht versehentlich. */}
        <Button
          size="sm"
          variant="outline"
          className="bg-card"
          autoFocus
          onClick={onKeep}
        >
          {labels.keep}
        </Button>
      </div>
    </div>
  )
}
