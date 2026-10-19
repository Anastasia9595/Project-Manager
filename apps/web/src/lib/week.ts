const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
})

const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
})

export const DAYS_PER_WEEK = 7

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/** Montag der Woche, in der `date` liegt. */
export function startOfWeek(date: Date): Date {
  const daysSinceMonday = (date.getDay() + 6) % 7
  return addDays(date, -daysSinceMonday)
}

/** Die 7 Tage (Mo-So) ab dem Montag `weekStart`. */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: DAYS_PER_WEEK }, (_, index) =>
    addDays(weekStart, index)
  )
}

export function formatWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()]!
}

export function formatMonthYear(date: Date): string {
  return MONTH_YEAR_FORMATTER.format(date)
}

/** z.B. "01.09." */
export function formatDayMonth(date: Date): string {
  return DAY_MONTH_FORMATTER.format(date)
}

/** z.B. "Mo, 01.09." */
export function formatDayLabel(date: Date): string {
  return `${formatWeekdayShort(date)}, ${formatDayMonth(date)}`
}

/** Mo-Fr: Anzahl der Arbeitstage ab dem Wochenstart. */
export const WORKDAYS_PER_WEEK = 5

/** Die 5 Arbeitstage (Mo-Fr) ab dem Montag `weekStart`. */
export function getWorkweekDays(weekStart: Date): Date[] {
  return getWeekDays(weekStart).slice(0, WORKDAYS_PER_WEEK)
}

/** Schlüssel eines Kalendertags in Ortszeit, z.B. "2026-10-05". */
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Gegenstück zu `toDayKey`: "2026-10-05" -> 5. Okt. 2026, 00:00 Uhr Ortszeit. */
export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year!, month! - 1, day!)
}
