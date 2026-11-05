import { parseDayKey, toDayKey } from "@/lib/week"

/** Anzeige eines YYYY-MM-DD-Werts: de "05.11.2026", sonst "11/05/2026"; leer bleibt leer. */
export function formatPickerDate(value: string, locale?: string): string {
  if (!value) return ""
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDayKey(value))
}

/** Tage vor `minDate` (YYYY-MM-DD) sind nicht wählbar; ohne `minDate` ist alles frei. */
export function isBeforeMinDate(day: Date, minDate?: string): boolean {
  return !!minDate && toDayKey(day) < minDate
}
