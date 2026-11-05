/** Zeile aus `time_entries`, nur die geladenen Felder (`work_date` als "YYYY-MM-DD"). */
export type TimeEntryRow = {
  work_date: string
  hours: number | null
  minutes: number | null
}

/** Zeile aus `time_entries` für die Zeiterfassung (mit Aufgabe und Druckstrecke). */
export type TimeBookingRow = {
  id: string
  work_date: string
  hours: number | null
  minutes: number | null
  note: string | null
  user_created: string | null
  task: { id: string; printing_lines: { id: string } | null } | null
}

/** Felder, die beim Anlegen/Ändern nach Directus geschrieben werden. */
export type TimeEntryWrite = {
  task: string
  work_date: string
  hours: number
  minutes: number
  note: string | null
}

/** Von der API akzeptierte Buchungsdaten (`project` und `user` bestimmt der Server aus Aufgabe bzw. Session). */
export type WritableBooking = {
  task: string
  date: string
  duration_minutes: number
  description: string | null
}
