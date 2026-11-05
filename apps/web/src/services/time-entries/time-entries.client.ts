import { toDayKey } from "@/lib/week"
import type { TimeEntry } from "@/models/task"

const SECONDS_PER_MINUTE = 60
// Obergrenze der API; ein vergessener Timer soll keinen 400er auslösen.
const MAX_MINUTES = 1440

/** Bucht einen beendeten Timer-Eintrag nach Directus; wirft bei Fehlern. Mindestens 1 Minute, auf volle Minuten gerundet. */
export async function bookTimerEntry(entry: TimeEntry): Promise<void> {
  const response = await fetch("/api/time-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: entry.taskId,
      date: toDayKey(entry.startedAt),
      duration_minutes: Math.min(
        MAX_MINUTES,
        Math.max(1, Math.round(entry.seconds / SECONDS_PER_MINUTE))
      ),
      description: null,
    }),
  })
  if (!response.ok)
    throw new Error(`Zeit konnte nicht gebucht werden (${response.status})`)
}
