import { toDayKey } from "@/lib/week"
import type { TimeBooking, TimeBookingInput } from "@/models/time-booking"

// Datenzugriff der Zeiterfassung über die API (`/api/time-entries`); die Directus-Rechte begrenzen auf eigene Einträge.

export type TimeBookingRepository = {
  /** Buchungen von Montag bis Sonntag der Woche ab `weekStart`. */
  getEntriesForWeek: (weekStart: Date) => Promise<TimeBooking[]>
  /** IDs aller Aufgaben mit mindestens einer Buchung – Grundlage für „In Bearbeitung“. */
  getBookedTaskIds: () => Promise<Set<string>>
  createEntry: (input: TimeBookingInput) => Promise<TimeBooking>
  updateEntry: (
    id: string,
    changes: Partial<TimeBookingInput>
  ) => Promise<TimeBooking>
  deleteEntry: (id: string) => Promise<void>
}

const BASE = "/api/time-entries"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok)
    throw new Error(
      `Zeiterfassung: ${init?.method ?? "GET"} ${url} → ${response.status}`
    )
  return (response.status === 204 ? undefined : await response.json()) as T
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

/** Nur diese Felder schreibt der Server; `project` und `user` ergeben sich aus Aufgabe und Session. */
function toWriteBody(input: Partial<TimeBookingInput>) {
  const { task, date, duration_minutes, description } = input
  return Object.fromEntries(
    Object.entries({ task, date, duration_minutes, description }).filter(
      ([, value]) => value !== undefined
    )
  )
}

/** Repository für die Buchungen der angemeldeten Person (`userId` bleibt für die Schnittstelle erhalten). */
export function createTimeBookingRepository(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Schnittstelle bleibt gleich
  _userId: string
): TimeBookingRepository {
  return {
    async getEntriesForWeek(weekStart) {
      const { entries } = await request<{ entries: TimeBooking[] }>(
        `${BASE}?week=${toDayKey(weekStart)}`
      )
      return entries
    },
    async getBookedTaskIds() {
      const { taskIds } = await request<{ taskIds: string[] }>(
        `${BASE}/booked-tasks`
      )
      return new Set(taskIds)
    },
    createEntry: (input) =>
      request<TimeBooking>(BASE, jsonInit("POST", toWriteBody(input))),
    updateEntry: (id, changes) =>
      request<TimeBooking>(
        `${BASE}/${encodeURIComponent(id)}`,
        jsonInit("PATCH", toWriteBody(changes))
      ),
    async deleteEntry(id) {
      await request<void>(`${BASE}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
    },
  }
}
