import { DUMMY_TRACKED_TASKS } from "@/dummy-data/tracked-tasks"
import { DAYS_PER_WEEK, addDays, startOfWeek, toDayKey } from "@/lib/week"
import type { TimeBooking } from "@/models/time-booking"

// TODO: durch Directus-Daten ersetzen (`readItems("time_entries", ...)` im Repository).
// Aufgaben und Projekte stammen aus `DUMMY_TRACKED_TASKS`, damit alle Seiten zusammenpassen.
// Die Buchungen liegen relativ zur aktuellen Woche, damit die Übersicht nie leer ist.

type DummyBookingSpec = {
  /** 0 = aktuelle Woche, 1 = Vorwoche. */
  weeksAgo: number
  /** 0 = Montag … 4 = Freitag. */
  weekday: number
  /** Index in `DUMMY_TRACKED_TASKS`. */
  taskIndex: number
  minutes: number
  description?: string
}

const SPECS: DummyBookingSpec[] = [
  { weeksAgo: 0, weekday: 0, taskIndex: 0, minutes: 120, description: "Erste Fassung aufgestellt" },
  { weeksAgo: 0, weekday: 0, taskIndex: 1, minutes: 120 },
  { weeksAgo: 0, weekday: 0, taskIndex: 16, minutes: 60, description: "Abstimmung mit der Kundin" },
  { weeksAgo: 0, weekday: 0, taskIndex: 18, minutes: 180, description: "Seiten 1–8 gesetzt" },
  { weeksAgo: 0, weekday: 1, taskIndex: 0, minutes: 90 },
  { weeksAgo: 0, weekday: 1, taskIndex: 16, minutes: 120, description: "Freigaberunde vorbereitet" },
  { weeksAgo: 0, weekday: 1, taskIndex: 18, minutes: 90 },
  { weeksAgo: 0, weekday: 2, taskIndex: 18, minutes: 60, description: "Korrekturen aus Lektorat eingearbeitet" },
  { weeksAgo: 0, weekday: 2, taskIndex: 2, minutes: 40 },
  { weeksAgo: 0, weekday: 2, taskIndex: 2, minutes: 30, description: "Bildunterschriften angepasst" },
  { weeksAgo: 0, weekday: 2, taskIndex: 5, minutes: 60 },
  { weeksAgo: 0, weekday: 3, taskIndex: 5, minutes: 150, description: "Raster überarbeitet" },
  { weeksAgo: 0, weekday: 3, taskIndex: 3, minutes: 75 },
  { weeksAgo: 0, weekday: 4, taskIndex: 1, minutes: 105, description: "Rückmeldungen eingearbeitet" },
  { weeksAgo: 1, weekday: 0, taskIndex: 0, minutes: 240 },
  { weeksAgo: 1, weekday: 1, taskIndex: 2, minutes: 300, description: "Layout-Varianten" },
  { weeksAgo: 1, weekday: 2, taskIndex: 18, minutes: 420 },
  { weeksAgo: 1, weekday: 3, taskIndex: 1, minutes: 360 },
  { weeksAgo: 1, weekday: 4, taskIndex: 3, minutes: 210 },
]

function toBooking(
  spec: DummyBookingSpec,
  index: number,
  currentWeekStart: Date,
  userId: string
): TimeBooking {
  const task = DUMMY_TRACKED_TASKS[spec.taskIndex % DUMMY_TRACKED_TASKS.length]!
  const date = addDays(
    currentWeekStart,
    spec.weekday - spec.weeksAgo * DAYS_PER_WEEK
  )
  return {
    id: `entry-${index + 1}`,
    project: task.projectId,
    task: task.id,
    date: toDayKey(date),
    duration_minutes: spec.minutes,
    description: spec.description ?? null,
    user: userId,
  }
}

/**
 * Beispielbuchungen für `userId`, nur bis heute – in der Zukunft kann noch
 * niemand gearbeitet haben.
 */
export function createDummyTimeEntries(
  today: Date,
  userId: string
): TimeBooking[] {
  const todayKey = toDayKey(today)
  return SPECS.map((spec, index) =>
    toBooking(spec, index, startOfWeek(today), userId)
  ).filter((booking) => booking.date <= todayKey)
}
