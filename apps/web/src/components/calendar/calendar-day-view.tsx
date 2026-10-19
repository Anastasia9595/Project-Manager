import { CalendarEntryCard } from "@/components/calendar/calendar-entry-card"
import type { Dictionary } from "@/i18n"
import type { CalendarEntry } from "@/models/calendar-entry"

/** Tagesansicht: alle Einträge des Tages, wichtigster zuerst. */
export function CalendarDayView({
  entries,
  today,
  labels,
  onToggleTask,
}: {
  /** Bereits nach Wichtigkeit sortiert. */
  entries: CalendarEntry[]
  today: Date
  labels: Dictionary["calendarPage"]
  onToggleTask: (taskId: string) => void
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-input bg-background px-4 py-16 text-center text-sm text-muted-foreground">
        {labels.noEntries}
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 rounded-xl border border-input bg-background p-3">
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
  )
}
