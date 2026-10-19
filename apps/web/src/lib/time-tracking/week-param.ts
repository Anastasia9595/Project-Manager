import { getIsoWeek } from "@/lib/calendar/calendar-view"
import { DAYS_PER_WEEK, addDays, startOfWeek } from "@/lib/week"

/** Name des URL-Parameters, z.B. `?week=2026-W42`. */
export const WEEK_PARAM = "week"

const WEEK_PARAM_PATTERN = /^(\d{4})-W(\d{2})$/
/** Der 4. Januar liegt nach ISO 8601 immer in KW 1. */
const DAY_IN_FIRST_ISO_WEEK = 4
/** Donnerstag = Montag + 3 – er bestimmt das Jahr einer ISO-Woche. */
const MONDAY_TO_THURSDAY = 3

/** Jahr der ISO-Woche: Ende Dezember kann schon zu KW 1 des Folgejahres gehören. */
export function getIsoWeekYear(date: Date): number {
  return addDays(startOfWeek(date), MONDAY_TO_THURSDAY).getFullYear()
}

/** z.B. Mi, 14.10.2026 -> "2026-W42" */
export function formatWeekParam(date: Date): string {
  const week = String(getIsoWeek(date)).padStart(2, "0")
  return `${getIsoWeekYear(date)}-W${week}`
}

/** "2026-W42" -> Montag, 12.10.2026; ungültige Werte (auch "2026-W53") -> null. */
export function parseWeekParam(value: string | null | undefined): Date | null {
  const match = value?.match(WEEK_PARAM_PATTERN)
  if (!match) return null
  const year = Number(match[1])
  const week = Number(match[2])
  const firstWeekStart = startOfWeek(new Date(year, 0, DAY_IN_FIRST_ISO_WEEK))
  const weekStart = addDays(firstWeekStart, (week - 1) * DAYS_PER_WEEK)
  // Rückwärts prüfen fängt KW 0 und KW 53 in Jahren mit nur 52 Wochen ab.
  return formatWeekParam(weekStart) === value ? weekStart : null
}

/** Montag der Woche aus dem URL-Parameter, sonst der aktuellen Woche. */
export function resolveWeekStart(
  value: string | null | undefined,
  today: Date
): Date {
  return parseWeekParam(value) ?? startOfWeek(today)
}
