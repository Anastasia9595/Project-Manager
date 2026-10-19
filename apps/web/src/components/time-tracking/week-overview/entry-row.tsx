import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

import { IconButton } from "@/components/shared/icon-button"
import { deleteButtonId } from "@/components/time-tracking/week-overview/focus"
import type { PopoverLabels } from "@/components/time-tracking/week-overview/types"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import type { TimeBooking } from "@/models/time-booking"

/** Einzeleintrag im Popover: Dauer, Beschreibung, Bearbeiten und Löschen. */
export function EntryRow({
  entry,
  labels,
  onEdit,
  onRequestDelete,
}: {
  entry: TimeBooking
  labels: PopoverLabels
  onEdit: () => void
  onRequestDelete: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-foreground tabular-nums">
          {formatDuration(entry.duration_minutes)}
        </p>
        <p
          className={cn(
            "text-sm text-table-foreground",
            !entry.description && "italic"
          )}
        >
          {entry.description ?? labels.noDescription}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <IconButton
          icon={PencilEdit02Icon}
          label={labels.edit}
          className="text-due-today"
          onClick={onEdit}
        />
        <IconButton
          id={deleteButtonId(entry)}
          icon={Delete02Icon}
          label={labels.delete}
          onClick={onRequestDelete}
        />
      </div>
    </div>
  )
}
