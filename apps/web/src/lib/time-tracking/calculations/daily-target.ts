import { MINUTES_PER_HOUR } from "@/lib/time-tracking/calculations/duration"
import { isWeekend, toDayKey } from "@/lib/week"

const DEFAULT_DAILY_TARGET_HOURS = 8

export const DEFAULT_DAILY_TARGET_MINUTES =
  DEFAULT_DAILY_TARGET_HOURS * MINUTES_PER_HOUR

/**
 * Tages-Soll in Minuten. Als Funktion übergeben, damit später einzelne Tage
 * (Feiertag, Urlaub, Krankheit) überschrieben werden können.
 */
export type DailyTarget = (date: Date) => number

export const defaultDailyTarget: DailyTarget = (date) =>
  isWeekend(date) ? 0 : DEFAULT_DAILY_TARGET_MINUTES

/** Überschreibt das Soll einzelner Tage (Schlüssel aus `toDayKey`). */
export function withDailyTargetOverrides(
  overrides: ReadonlyMap<string, number>,
  fallback: DailyTarget = defaultDailyTarget
): DailyTarget {
  return (date) => overrides.get(toDayKey(date)) ?? fallback(date)
}

export function targetsByDay(
  days: Date[],
  dailyTarget: DailyTarget = defaultDailyTarget
): number[] {
  return days.map(dailyTarget)
}
