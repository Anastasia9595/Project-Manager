export type DueTone = "overdue" | "today" | "upcoming"

export type DueInfo = {
  label: string
  tone: DueTone
  /** Hervorzuhebender Zusatz zum Datum, z.B. "vor 3 Tagen". */
  note?: string
}

function startOfDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Differenz in Kalendertagen (`date` minus `today`), unabhängig von Uhrzeit und Sommerzeit. */
export function diffInCalendarDays(date: Date, today: Date): number {
  return Math.round((startOfDay(date) - startOfDay(today)) / MS_PER_DAY)
}

export function getDueInfo(date: Date, today: Date = new Date()): DueInfo {
  const diffDays = diffInCalendarDays(date, today)

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)} Tage überfällig`, tone: "overdue" }
  }
  if (diffDays === 0) {
    return { label: "heute", tone: "today" }
  }
  return { label: `in ${diffDays} Tagen`, tone: "upcoming" }
}

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})

export function formatShortDate(date: Date): string {
  return DATE_FORMATTER.format(date)
}

/**
 * Fälligkeits-Label für Liste und Kanban der Aufgaben, immer mit Datum:
 * Datum als `label`; überfällig und heute zusätzlich mit `note`.
 */
export function getRelativeDueInfo(date: Date, today: Date = new Date()): DueInfo {
  const diffDays = diffInCalendarDays(date, today)

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    const ago = days === 1 ? "vor 1 Tag" : `vor ${days} Tagen`
    return { label: formatShortDate(date), note: ago, tone: "overdue" }
  }
  if (diffDays === 0) {
    return { label: formatShortDate(date), note: "heute", tone: "today" }
  }
  return { label: formatShortDate(date), tone: "upcoming" }
}
