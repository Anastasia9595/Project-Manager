import { MINUTES_PER_HOUR } from "@/lib/time-tracking/calculations/duration"

// Auswertung der Felder „Stunden“ und „Minuten“ (Text, damit leere Eingaben möglich sind).

export type DurationInput = { hours: string; minutes: string }

/** Dauer ungültig (keine ganze Zahl, Minuten > 59) oder kürzer als 1 Minute. */
export type DurationError = "invalid" | "tooShort"

/** Höchster Wert im Minutenfeld; 60 Minuten gehören in das Stundenfeld. */
export const MAX_MINUTES_INPUT = MINUTES_PER_HOUR - 1
const WHOLE_NUMBER = /^\d+$/

/** Leeres Feld -> 0; ganze, nicht negative Zahl -> Zahl; sonst `null` (ungültig). */
function parseWholeNumber(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === "") return 0
  return WHOLE_NUMBER.test(trimmed) ? Number(trimmed) : null
}

/** Ganze Stunden und 0-59 Minuten – Dezimal- und Minuswerte werden nicht still gekürzt. */
export function isValidDuration(values: DurationInput): boolean {
  const hours = parseWholeNumber(values.hours)
  const minutes = parseWholeNumber(values.minutes)
  return hours !== null && minutes !== null && minutes <= MAX_MINUTES_INPUT
}

/** Gesamtdauer in Minuten; ungültige Felder zählen als 0 (siehe `isValidDuration`). */
export function durationMinutes(values: DurationInput): number {
  return (
    (parseWholeNumber(values.hours) ?? 0) * MINUTES_PER_HOUR +
    (parseWholeNumber(values.minutes) ?? 0)
  )
}

export function validateDuration(values: DurationInput): DurationError | undefined {
  if (!isValidDuration(values)) return "invalid"
  if (durationMinutes(values) < 1) return "tooShort"
  return undefined
}
