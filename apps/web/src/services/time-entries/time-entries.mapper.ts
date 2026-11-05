import {
  MINUTES_PER_HOUR,
  splitMinutes,
} from "@/lib/time-tracking/calculations/duration"
import type { TimeBooking } from "@/models/time-booking"

import type {
  TimeBookingRow,
  TimeEntryRow,
  TimeEntryWrite,
  WritableBooking,
} from "./time-entries.types"

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const MAX_MINUTES = 24 * MINUTES_PER_HOUR
const MAX_DESCRIPTION_LENGTH = 2000

/** Dauer eines Directus-Zeiteintrags in Minuten (`hours` + `minutes`). */
export function toEntryMinutes(
  row: Pick<TimeEntryRow, "hours" | "minutes">
): number {
  return (row.hours ?? 0) * MINUTES_PER_HOUR + (row.minutes ?? 0)
}

export function toTimeBooking(row: TimeBookingRow): TimeBooking {
  return {
    id: row.id,
    project: row.task?.printing_lines?.id ?? "",
    task: row.task?.id ?? "",
    date: row.work_date,
    duration_minutes: toEntryMinutes(row),
    description: row.note,
    user: row.user_created ?? "",
  }
}

export function toTimeEntryWrite(input: WritableBooking): TimeEntryWrite {
  return {
    task: input.task,
    work_date: input.date,
    ...splitMinutes(input.duration_minutes),
    note: input.description,
  }
}

export function toTimeEntryChanges(
  changes: Partial<WritableBooking>
): Partial<TimeEntryWrite> {
  return {
    ...(changes.task !== undefined && { task: changes.task }),
    ...(changes.date !== undefined && { work_date: changes.date }),
    ...(changes.duration_minutes !== undefined &&
      splitMinutes(changes.duration_minutes)),
    ...(changes.description !== undefined && { note: changes.description }),
  }
}

const isTask = (value: unknown) => typeof value === "string" && value.length > 0
function isCalendarDay(key: string): boolean {
  const [y, m, d] = key.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  )
}

/** Gültiger Kalendertag `YYYY-MM-DD` (lehnt z.B. 2026-02-30 ab). */
export const isDate = (value: unknown): value is string =>
  typeof value === "string" && DAY_KEY.test(value) && isCalendarDay(value)
const isDuration = (value: unknown) =>
  Number.isInteger(value) &&
  (value as number) >= 1 &&
  (value as number) <= MAX_MINUTES
const isDescription = (value: unknown) =>
  value === null ||
  (typeof value === "string" && value.length <= MAX_DESCRIPTION_LENGTH)

const isObject = (body: unknown): body is Record<string, unknown> =>
  typeof body === "object" && body !== null && !Array.isArray(body)

export function isWritableBooking(body: unknown): body is WritableBooking {
  return (
    isObject(body) &&
    isTask(body.task) &&
    isDate(body.date) &&
    isDuration(body.duration_minutes) &&
    isDescription(body.description)
  )
}

export function isBookingChanges(
  body: unknown
): body is Partial<WritableBooking> {
  if (!isObject(body)) return false
  const checks: [string, (value: unknown) => boolean][] = [
    ["task", isTask],
    ["date", isDate],
    ["duration_minutes", isDuration],
    ["description", isDescription],
  ]
  const present = checks.filter(([key]) => key in body)
  return present.length > 0 && present.every(([key, check]) => check(body[key]))
}
