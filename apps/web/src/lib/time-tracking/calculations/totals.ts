import {
  defaultDailyTarget,
  targetsByDay,
  type DailyTarget,
} from "@/lib/time-tracking/calculations/daily-target"
import { MINUTES_PER_HOUR } from "@/lib/time-tracking/calculations/duration"
import { toDayKey } from "@/lib/week"
import type { TimeBooking } from "@/models/time-booking"

// Summen, Soll/Ist-Differenzen und Fortschritt – ohne React, ohne Datenzugriff.

const PERCENT = 100
const DAILY_LIMIT_HOURS = 10

/** Ab mehr als dieser Tagessumme warnt das Formular. */
export const DAILY_LIMIT_MINUTES = DAILY_LIMIT_HOURS * MINUTES_PER_HOUR

type WithDuration = Pick<TimeBooking, "duration_minutes">

export function sumValues(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

export function sumMinutes(entries: WithDuration[]): number {
  return sumValues(entries.map((entry) => entry.duration_minutes))
}

export function entriesOn<T extends Pick<TimeBooking, "date">>(
  entries: T[],
  date: Date
): T[] {
  const key = toDayKey(date)
  return entries.filter((entry) => entry.date === key)
}

/** Nur Buchungen an den Tagen `days`, z.B. Mo-Fr ohne Wochenende. */
export function entriesWithin<T extends Pick<TimeBooking, "date">>(
  entries: T[],
  days: Date[]
): T[] {
  const keys = new Set(days.map(toDayKey))
  return entries.filter((entry) => keys.has(entry.date))
}

/** Gebuchte Minuten an `date` ohne den Eintrag `excludedId` (z.B. den bearbeiteten). */
export function minutesOnDayExcept(
  entries: TimeBooking[],
  date: Date,
  excludedId: string | undefined
): number {
  return sumMinutes(entriesOn(entries, date).filter((entry) => entry.id !== excludedId))
}

/** Minuten je Tag, in der Reihenfolge von `days`. */
export function minutesByDay(
  entries: Pick<TimeBooking, "date" | "duration_minutes">[],
  days: Date[]
): number[] {
  return days.map((day) => sumMinutes(entriesOn(entries, day)))
}

export function isFutureDay(date: Date, today: Date): boolean {
  return toDayKey(date) > toDayKey(today)
}

/** Werte zukünftiger Tage durch `null` ersetzen – dort zählt noch nichts. */
export function hideFutureDays(
  values: number[],
  days: Date[],
  today: Date
): (number | null)[] {
  return days.map((day, index) =>
    isFutureDay(day, today) ? null : values[index]!
  )
}

/** Ist minus Soll je Tag; zukünftige Tage zählen nicht mit (`null`). */
export function differencesByDay(
  actual: number[],
  targets: number[],
  days: Date[],
  today: Date
): (number | null)[] {
  return days.map((day, index) =>
    isFutureDay(day, today) ? null : actual[index]! - targets[index]!
  )
}

export function sumDifferences(differences: (number | null)[]): number {
  return sumValues(differences.filter((value) => value !== null))
}

/** Erreichter Anteil am Soll in ganzen Prozent (abgerundet: 100 % erst bei
 * erreichtem Soll); ohne Soll 0 %. */
export function progressPercent(actual: number, target: number): number {
  return target > 0 ? Math.floor((actual / target) * PERCENT) : 0
}

export function exceedsDailyLimit(minutes: number): boolean {
  return minutes > DAILY_LIMIT_MINUTES
}

export type WeekTotals = {
  perDay: number[]
  targets: number[]
  /** `null` für zukünftige Tage. */
  differences: (number | null)[]
  week: number
  weekTarget: number
  /** Summe der Differenzen bis heute. */
  weekDifference: number
}

/** Ist, Soll und Differenz je Tag und für die ganze Woche. */
export function summarizeWeek(
  entries: Pick<TimeBooking, "date" | "duration_minutes">[],
  days: Date[],
  today: Date,
  dailyTarget: DailyTarget = defaultDailyTarget
): WeekTotals {
  const perDay = minutesByDay(entries, days)
  const targets = targetsByDay(days, dailyTarget)
  const differences = differencesByDay(perDay, targets, days, today)
  return {
    perDay,
    targets,
    differences,
    week: sumValues(perDay),
    weekTarget: sumValues(targets),
    weekDifference: sumDifferences(differences),
  }
}
