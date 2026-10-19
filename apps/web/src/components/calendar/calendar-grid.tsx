import { CalendarDayCell } from "@/components/calendar/calendar-day-cell"
import type { Dictionary } from "@/i18n"
import { toDayKey } from "@/lib/calendar/entries"
import { isSameDay } from "@/lib/week"
import type { CalendarEntry } from "@/models/calendar-entry"

/** Wochenraster Mo-So: Monatsansicht (mehrere Zeilen) und Wochenansicht (eine Zeile). */
export function CalendarGrid({
  weeks,
  entriesByDay,
  isCurrentPeriod,
  showAll = false,
  today,
  labels,
  onToggleTask,
  onOpenDay,
}: {
  weeks: Date[][]
  entriesByDay: Map<string, CalendarEntry[]>
  /** false für angeschnittene Tage aus Vor-/Folgemonat. */
  isCurrentPeriod: (day: Date) => boolean
  showAll?: boolean
  today: Date
  labels: Dictionary["calendarPage"]
  onToggleTask: (taskId: string) => void
  onOpenDay: (day: Date) => void
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-245 overflow-hidden rounded-xl border border-input">
        <div className="grid grid-cols-7 border-b border-input bg-background">
          {labels.weekdays.map((weekday, index) => (
            <div
              key={weekday}
              className={`border-r border-input py-2 text-center text-xs font-semibold last:border-r-0 ${index >= 5 ? "text-muted-foreground" : "text-foreground"}`}
            >
              {weekday}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div
            key={toDayKey(week[0]!)}
            className="grid grid-cols-7 [&:last-child>div]:border-b-0"
          >
            {week.map((day) => (
              <CalendarDayCell
                key={toDayKey(day)}
                day={day}
                entries={entriesByDay.get(toDayKey(day)) ?? []}
                isToday={isSameDay(day, today)}
                isCurrentMonth={isCurrentPeriod(day)}
                showAll={showAll}
                today={today}
                labels={labels}
                onToggleTask={onToggleTask}
                onOpenDay={onOpenDay}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
