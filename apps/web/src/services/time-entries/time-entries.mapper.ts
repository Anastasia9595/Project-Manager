import { MINUTES_PER_HOUR } from "@/lib/time-tracking/calculations/duration"

import type { TimeEntryRow } from "./time-entries.types"

/** Dauer eines Directus-Zeiteintrags in Minuten (`hours` + `minutes`). */
export function toEntryMinutes(
  row: Pick<TimeEntryRow, "hours" | "minutes">
): number {
  return (row.hours ?? 0) * MINUTES_PER_HOUR + (row.minutes ?? 0)
}
