import { getIsoWeek } from "@/lib/calendar/calendar-view"
import { addDays, formatDayMonth, formatWeekdayShort } from "@/lib/week"
import { fillTemplate } from "@/utils/fill-template"

const LAST_DAY_OF_WEEK = 6

// Feste Kürzel statt Intl: die ICU-Daten liefern je nach Laufzeit "Okt" oder "Okt.",
// das würde zwischen Server- und Browser-Rendering abweichen.
const MONTH_SHORT = [
  "Jan.", "Feb.", "März", "Apr.", "Mai", "Juni",
  "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez.",
] as const

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function dayMonth(date: Date): string {
  return `${date.getDate()}. ${MONTH_SHORT[date.getMonth()]}`
}

/**
 * Zeitraum Mo-So ohne Wiederholungen, z.B. "12.–18. Okt. 2026",
 * "28. Sep.–4. Okt. 2026" oder "29. Dez. 2025–4. Jan. 2026".
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, LAST_DAY_OF_WEEK)
  const end = `${dayMonth(weekEnd)} ${weekEnd.getFullYear()}`
  if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
    return `${dayMonth(weekStart)} ${weekStart.getFullYear()}–${end}`
  }
  if (weekStart.getMonth() !== weekEnd.getMonth()) {
    return `${dayMonth(weekStart)}–${end}`
  }
  return `${weekStart.getDate()}.–${end}`
}

/** Wochenlabel aus Vorlage, z.B. "KW {week} · {range}" -> "KW 42 · 12.–18. Okt. 2026". */
export function formatWeekLabel(weekStart: Date, template: string): string {
  return fillTemplate(template, {
    week: getIsoWeek(weekStart),
    range: formatWeekRange(weekStart),
  })
}

/** z.B. "Mi, 14.10.2026" */
export function formatBookingDate(date: Date): string {
  return `${formatWeekdayShort(date)}, ${FULL_DATE_FORMATTER.format(date)}`
}

/** Spaltenkopf der Wochenübersicht, z.B. "Mo 12." */
export function formatColumnDay(date: Date): string {
  return `${formatWeekdayShort(date)} ${date.getDate()}.`
}

/** Kurzform für Screenreader-Labels, z.B. "Mi 14.10." */
export function formatShortDate(date: Date): string {
  return `${formatWeekdayShort(date)} ${formatDayMonth(date)}`
}

/** CSV-Datum, z.B. "14.10.2026" */
export function formatPlainDate(date: Date): string {
  return FULL_DATE_FORMATTER.format(date)
}
