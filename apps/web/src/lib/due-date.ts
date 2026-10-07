export type DueTone = "overdue" | "today" | "upcoming"

export type DueInfo = {
  label: string
  tone: DueTone
}

function startOfDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function getDueInfo(date: Date, today: Date = new Date()): DueInfo {
  const diffDays = Math.round((startOfDay(date) - startOfDay(today)) / MS_PER_DAY)

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
 * Kurzes Fälligkeits-Label für Aufgaben-Tabellen:
 * überfällig -> "vor 3 Tagen", heute -> "heute", später -> Datum.
 */
export function getRelativeDueInfo(date: Date, today: Date = new Date()): DueInfo {
  const diffDays = Math.round((startOfDay(date) - startOfDay(today)) / MS_PER_DAY)

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    return { label: days === 1 ? "vor 1 Tag" : `vor ${days} Tagen`, tone: "overdue" }
  }
  if (diffDays === 0) {
    return { label: "heute", tone: "today" }
  }
  return { label: formatShortDate(date), tone: "upcoming" }
}
