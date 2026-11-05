import { MINUTES_PER_HOUR } from "@/lib/time-tracking/calculations/duration"
import {
  defaultDailyTarget,
  type DailyTarget,
} from "@/lib/time-tracking/calculations/daily-target"
import { getWorkweekDays, toDayKey } from "@/lib/week"
import type { WorkDay } from "@/models/work-day"
import { toEntryMinutes } from "@/services/time-entries/time-entries.mapper"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

const DAY_LABELS = [
  ["MON", "Montag"],
  ["DIE", "Dienstag"],
  ["MIT", "Mittwoch"],
  ["DON", "Donnerstag"],
  ["FRE", "Freitag"],
] as const

/** Ist- und Soll-Stunden je Arbeitstag (Mo–Fr) der Woche ab `weekStart`; andere Tage werden ignoriert. */
export function toWorkWeek(
  rows: TimeEntryRow[],
  weekStart: Date,
  dailyTarget: DailyTarget = defaultDailyTarget
): WorkDay[] {
  const minutesByDay = new Map<string, number>()
  for (const row of rows) {
    minutesByDay.set(
      row.work_date,
      (minutesByDay.get(row.work_date) ?? 0) + toEntryMinutes(row)
    )
  }
  return getWorkweekDays(weekStart).map((day, index) => ({
    label: DAY_LABELS[index]![0],
    name: DAY_LABELS[index]![1],
    targetHours: dailyTarget(day) / MINUTES_PER_HOUR,
    actualHours: (minutesByDay.get(toDayKey(day)) ?? 0) / MINUTES_PER_HOUR,
  }))
}
