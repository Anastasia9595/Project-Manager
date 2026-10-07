const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
})

const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
})

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
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function formatWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()]!
}

export function formatMonthYear(date: Date): string {
  return MONTH_YEAR_FORMATTER.format(date)
}

/** z.B. "Mo, 01.09." */
export function formatDayLabel(date: Date): string {
  return `${formatWeekdayShort(date)}, ${DAY_MONTH_FORMATTER.format(date)}`
}
