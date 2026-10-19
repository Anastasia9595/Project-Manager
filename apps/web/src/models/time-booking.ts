/**
 * Zeitbuchung – angelehnt an die Directus-Collection `time_entries`.
 * Feldnamen entsprechen den Directus-Feldern, damit das Mapping später entfällt.
 * (`TimeEntry` in `task.ts` ist der Eintrag des Timers auf der Aufgaben-Seite.)
 */
export type TimeBooking = {
  id: string
  /** Verweis auf `Project.id` (Many-to-One `project`). */
  project: string
  /** Verweis auf `TrackedTask.id` (Many-to-One `task`). */
  task: string
  /** Directus-Feldtyp `date`, z.B. "2026-10-14". */
  date: string
  duration_minutes: number
  description: string | null
  /** Verweis auf `directus_users.id`. */
  user: string
}

/** Daten für neue oder geänderte Buchungen – die `id` vergibt das Backend. */
export type TimeBookingInput = Omit<TimeBooking, "id">
