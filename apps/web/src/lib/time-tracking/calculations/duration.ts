import { formatHoursMinutes } from "@/lib/tracked-tasks"

// Dauern formatieren und zerlegen. Alle Dauern sind in Minuten.

export const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60

/** Anzeige für leere Zellen, Nullwerte und zukünftige Tage. */
export const EMPTY_VALUE = "—"
const MINUS_SIGN = "−"
const PLUS_SIGN = "+"

/** z.B. 190 -> "3:10" (ohne Einheit, Betrag) */
export function formatClockMinutes(minutes: number): string {
  return formatHoursMinutes(Math.abs(minutes) * SECONDS_PER_MINUTE)
}

/** z.B. 190 -> "3:10 h" */
export function formatDuration(minutes: number): string {
  return `${formatClockMinutes(minutes)} h`
}

/** Differenzen mit Vorzeichen, z.B. "+3:00 h", "−1:30 h", "0:00 h". */
export function formatSignedDuration(minutes: number): string {
  const sign = minutes > 0 ? PLUS_SIGN : minutes < 0 ? MINUS_SIGN : ""
  return `${sign}${formatDuration(minutes)}`
}

/** Tabellenwert: 0 und fehlende Werte (zukünftige Tage) als „—“. */
export function formatOptionalDuration(minutes: number | null): string {
  return minutes ? formatDuration(minutes) : EMPTY_VALUE
}

export function formatOptionalSignedDuration(minutes: number | null): string {
  return minutes === null ? EMPTY_VALUE : formatSignedDuration(minutes)
}

export function splitMinutes(total: number): { hours: number; minutes: number } {
  return {
    hours: Math.floor(total / MINUTES_PER_HOUR),
    minutes: total % MINUTES_PER_HOUR,
  }
}
