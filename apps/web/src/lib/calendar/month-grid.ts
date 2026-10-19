import { addDays, getWeekDays, startOfWeek } from "@/lib/week"

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/**
 * Wochen (Mo-So) des Monatsrasters inkl. angeschnittener Tage
 * aus Vor- und Folgemonat - je nach Monat 4 bis 6 Zeilen.
 */
export function getMonthGrid(month: Date): Date[][] {
  const first = startOfMonth(month)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0)
  const weeks: Date[][] = []
  for (
    let weekStart = startOfWeek(first);
    weekStart <= last;
    weekStart = addDays(weekStart, 7)
  ) {
    weeks.push(getWeekDays(weekStart))
  }
  return weeks
}
