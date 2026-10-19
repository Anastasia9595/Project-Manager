import { CalendarEntryCard } from "@/components/calendar/calendar-entry-card"
import { CalendarMorePopover } from "@/components/calendar/calendar-more-popover"
import type { Dictionary } from "@/i18n"
import { formatDayMonth } from "@/lib/calendar/due-footer"
import { isWeekend } from "@/lib/week"
import type { CalendarEntry } from "@/models/calendar-entry"
import { fillTemplate } from "@/utils/fill-template"

export function CalendarDayCell({
  day,
  entries,
  isToday,
  isCurrentMonth,
  showAll = false,
  today,
  labels,
  onToggleTask,
  onOpenDay,
}: {
  day: Date
  /** Bereits nach Wichtigkeit sortiert. */
  entries: CalendarEntry[]
  isToday: boolean
  isCurrentMonth: boolean
  /** Wochenansicht: alle Einträge untereinander statt "+N weitere". */
  showAll?: boolean
  today: Date
  labels: Dictionary["calendarPage"]
  onToggleTask: (taskId: string) => void
  onOpenDay: (day: Date) => void
}) {
  const [primary] = entries
  const visible = showAll ? entries : primary ? [primary] : []
  const muted = !isCurrentMonth || isWeekend(day)

  return (
    <div
      className={`flex min-w-0 flex-col gap-2 border-r border-b border-input p-2 last:border-r-0 ${showAll ? "min-h-128" : "min-h-36"} ${muted ? "bg-background" : "bg-card"}`}
    >
      <button
        type="button"
        onClick={() => onOpenDay(day)}
        aria-label={fillTemplate(labels.openDay, { date: formatDayMonth(day) })}
        aria-current={isToday ? "date" : undefined}
        className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none ${
          isToday
            ? "bg-primary text-primary-foreground"
            : `hover:bg-secondary ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`
        }`}
      >
        {day.getDate()}
      </button>

      {visible.map((entry) => (
        <CalendarEntryCard
          key={entry.id}
          entry={entry}
          today={today}
          labels={labels}
          onToggleTask={onToggleTask}
        />
      ))}
      {!showAll && entries.length > 1 && (
        <CalendarMorePopover
          day={day}
          entries={entries}
          hiddenCount={entries.length - 1}
          today={today}
          labels={labels}
          onToggleTask={onToggleTask}
        />
      )}
    </div>
  )
}
