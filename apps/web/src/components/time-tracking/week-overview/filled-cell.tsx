import { useRef, useState } from "react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import { CellEntriesPopover } from "@/components/time-tracking/week-overview/cell-entries-popover"
import {
  OVERVIEW_HEADING_ID,
  cellButtonId,
  focusFirstAfterRender,
} from "@/components/time-tracking/week-overview/focus"
import {
  CELL_BUTTON_CLASS,
  type CellProps,
} from "@/components/time-tracking/week-overview/types"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import { sumMinutes } from "@/lib/time-tracking/calculations/totals"
import {
  formatBookingDate,
  formatShortDate,
} from "@/lib/time-tracking/date-labels"
import { fillTemplate } from "@/utils/fill-template"

/** Gefüllte Zelle: öffnet das Popover mit den Einzeleinträgen. */
export function FilledCell({
  target,
  taskTitle,
  projectTitle,
  entries,
  labels,
  popoverLabels,
  onAdd,
  onEdit,
  onDelete,
}: Omit<CellProps, "isFuture">) {
  const [open, setOpen] = useState(false)
  // Beim Wechsel ins Formular bekommt das Formular den Fokus, nicht die Zelle.
  const focusMovesToForm = useRef(false)
  const duration = formatDuration(sumMinutes(entries))

  function changeOpen(next: boolean) {
    if (next) focusMovesToForm.current = false
    setOpen(next)
  }

  function closeAndThen(action: () => void) {
    focusMovesToForm.current = true
    setOpen(false)
    action()
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        render={
          <button
            id={cellButtonId(target.taskId, target.date)}
            type="button"
            className={CELL_BUTTON_CLASS}
            aria-label={fillTemplate(labels.showEntries, {
              task: taskTitle,
              date: formatShortDate(target.date),
              duration,
            })}
          />
        }
      >
        {duration}
        <HugeiconsIcon
          icon={PencilEdit02Icon}
          strokeWidth={2}
          className="absolute right-1.5 size-3.5 text-due-today opacity-0 group-hover:opacity-100 group-aria-expanded:opacity-100"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-80 gap-0 p-0"
        finalFocus={() => !focusMovesToForm.current}
      >
        <CellEntriesPopover
          title={fillTemplate(popoverLabels.title, {
            task: taskTitle,
            date: formatBookingDate(target.date),
          })}
          projectTitle={projectTitle}
          entries={entries}
          labels={popoverLabels}
          onClose={() => setOpen(false)}
          onEmptied={() =>
            focusFirstAfterRender([
              cellButtonId(target.taskId, target.date),
              OVERVIEW_HEADING_ID,
            ])
          }
          onAdd={() => closeAndThen(() => onAdd(target))}
          onEdit={(entry) => closeAndThen(() => onEdit(entry))}
          onDelete={onDelete}
        />
      </PopoverContent>
    </Popover>
  )
}
