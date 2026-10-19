import { diffInCalendarDays } from "@/lib/due-date"
import { addDays, formatDayMonth, formatMonthYear, startOfWeek } from "@/lib/week"
import { fillTemplate } from "@/utils/fill-template"

export type CalendarView = "month" | "week" | "day"

export const CALENDAR_VIEWS: CalendarView[] = ["month", "week", "day"]

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const LONG_DAY_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

/**
 * Springt um `step` Monate/Wochen/Tage weiter. Beim Monatswechsel bleibt der
 * Tag erhalten (31.01. -> 28.02.), damit ein Wechsel zur Woche/Tag passt.
 */
export function shiftDate(date: Date, view: CalendarView, step: number): Date {
  if (view === "day") return addDays(date, step)
  if (view === "week") return addDays(date, step * 7)

  const target = new Date(date.getFullYear(), date.getMonth() + step, 1)
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate()
  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(date.getDate(), lastDay)
  )
}

/** Kalenderwoche nach ISO 8601 (Woche mit dem ersten Donnerstag = KW 1). */
export function getIsoWeek(date: Date): number {
  const thursday = addDays(startOfWeek(date), 3)
  const firstOfYear = new Date(thursday.getFullYear(), 0, 1)
  return Math.floor(diffInCalendarDays(thursday, firstOfYear) / 7) + 1
}

/** Titel über dem Kalender, z.B. "Oktober 2026", "KW 42 · 12.10. – 18.10.2026". */
export function getViewTitle(
  date: Date,
  view: CalendarView,
  weekTemplate: string
): string {
  if (view === "month") return formatMonthYear(date)
  if (view === "day") return LONG_DAY_FORMATTER.format(date)

  const start = startOfWeek(date)
  const range = `${formatDayMonth(start)} – ${FULL_DATE_FORMATTER.format(addDays(start, 6))}`
  return fillTemplate(weekTemplate, { week: getIsoWeek(date), range })
}
