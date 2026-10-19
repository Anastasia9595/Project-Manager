import { cn } from "@workspace/ui/lib/utils"

import { FilledCell } from "@/components/time-tracking/week-overview/filled-cell"
import { cellButtonId } from "@/components/time-tracking/week-overview/focus"
import {
  CELL_BUTTON_CLASS,
  type CellProps,
} from "@/components/time-tracking/week-overview/types"
import { EMPTY_VALUE } from "@/lib/time-tracking/calculations/duration"
import { formatShortDate } from "@/lib/time-tracking/date-labels"
import { fillTemplate } from "@/utils/fill-template"

/**
 * Tageszelle einer Aufgabe: gefüllt -> Popover mit Einträgen; leer -> Formular
 * vorbefüllen; zukünftiger Tag -> nur „—“ (dort kann noch nicht gebucht werden).
 */
export function OverviewCell(props: CellProps) {
  const { target, taskTitle, entries, isFuture, labels, onAdd } = props

  if (isFuture) {
    return <span className="text-muted-foreground">{EMPTY_VALUE}</span>
  }
  if (entries.length > 0) {
    return <FilledCell {...props} />
  }
  return (
    <button
      id={cellButtonId(target.taskId, target.date)}
      type="button"
      className={cn(CELL_BUTTON_CLASS, "text-muted-foreground")}
      aria-label={fillTemplate(labels.addEntry, {
        task: taskTitle,
        date: formatShortDate(target.date),
      })}
      onClick={() => onAdd(target)}
    >
      {EMPTY_VALUE}
    </button>
  )
}
