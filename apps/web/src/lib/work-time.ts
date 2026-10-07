import type { WorkDay } from "@/models/work-day"

const HOURS_FORMATTER = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 })

export function sumActualHours(days: WorkDay[]): number {
  return days.reduce((sum, day) => sum + day.actualHours, 0)
}

/** z.B. 34.5 -> "34,5" */
export function formatHours(hours: number): string {
  return HOURS_FORMATTER.format(hours)
}

/** Obergrenze der y-Achse: mindestens 10h, sonst auf die nächste gerade Stunde aufgerundet. */
export function getAxisMax(days: WorkDay[]): number {
  const highest = Math.max(...days.flatMap((day) => [day.targetHours, day.actualHours]))
  return Math.max(10, Math.ceil(highest / 2) * 2)
}

/** Ticks im 2h-Raster von 0 bis `max`. */
export function getAxisTicks(max: number): number[] {
  return Array.from({ length: max / 2 + 1 }, (_, index) => index * 2)
}
