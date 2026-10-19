import type { Dictionary } from "@/i18n"
import { CALENDAR_VIEWS, type CalendarView } from "@/lib/calendar/calendar-view"

/** Umschalter Monat / Woche / Tag. */
export function CalendarViewSwitch({
  value,
  onChange,
  labels,
}: {
  value: CalendarView
  onChange: (view: CalendarView) => void
  labels: Dictionary["calendarPage"]
}) {
  return (
    <div
      role="group"
      aria-label={labels.viewSwitch}
      className="flex rounded-4xl border border-border bg-input/30 p-0.5"
    >
      {CALENDAR_VIEWS.map((view) => {
        const active = view === value
        return (
          <button
            key={view}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(view)}
            className={`h-7 rounded-4xl px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none ${
              active
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {labels.views[view]}
          </button>
        )
      })}
    </div>
  )
}
