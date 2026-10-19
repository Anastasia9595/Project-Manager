import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import { CalendarEntryCard } from "@/components/calendar/calendar-entry-card"
import type { Dictionary } from "@/i18n"
import { formatDayMonth } from "@/lib/calendar/due-footer"
import type { CalendarEntry } from "@/models/calendar-entry"
import { fillTemplate } from "@/utils/fill-template"

/** Kompakte "+N weitere"-Card; öffnet eine Liste aller Einträge des Tages. */
export function CalendarMorePopover({
  day,
  entries,
  hiddenCount,
  today,
  labels,
  onToggleTask,
}: {
  day: Date
  entries: CalendarEntry[]
  hiddenCount: number
  today: Date
  labels: Dictionary["calendarPage"]
  onToggleTask: (taskId: string) => void
}) {
  return (
    <Popover>
      <PopoverTrigger className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
        {fillTemplate(labels.more, { count: hiddenCount })}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-3 p-3">
        <PopoverHeader>
          <PopoverTitle className="text-sm font-semibold">
            {fillTemplate(labels.moreTitle, { date: formatDayMonth(day) })}
          </PopoverTitle>
        </PopoverHeader>
        <ul className="-mr-1 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <li key={entry.id}>
              <CalendarEntryCard
                entry={entry}
                today={today}
                labels={labels}
                onToggleTask={onToggleTask}
              />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
