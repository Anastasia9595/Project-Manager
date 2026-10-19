import { addDays, isWeekend, toDayKey } from "@/lib/week"

/** Ein Tag ist buchbar, wenn er ein Werktag (Mo-Fr) und nicht in der Zukunft ist. */
export function isBookableDay(date: Date, today: Date): boolean {
  return !isWeekend(date) && toDayKey(date) <= toDayKey(today)
}

/** Letzter buchbarer Tag bis einschließlich `today` (am Wochenende: Freitag). */
export function lastBookableDayOnOrBefore(today: Date): Date {
  let day = today
  while (isWeekend(day)) day = addDays(day, -1)
  return day
}

/**
 * Vorbelegung des Datums: heute, falls in der Woche buchbar; sonst der letzte
 * buchbare Tag der Woche; liegt die ganze Woche in der Zukunft, der letzte
 * buchbare Tag vor heute.
 */
export function getDefaultBookingDate(workdays: Date[], today: Date): Date {
  const bookable = workdays.filter((day) => isBookableDay(day, today))
  return bookable.at(-1) ?? lastBookableDayOnOrBefore(today)
}
