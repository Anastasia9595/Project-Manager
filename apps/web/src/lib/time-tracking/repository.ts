import { createDummyTimeEntries } from "@/dummy-data/time-entries"
import { getWeekDays, toDayKey } from "@/lib/week"
import type { TimeBooking, TimeBookingInput } from "@/models/time-booking"

// Datenzugriff der Zeiterfassung. Aktuell Dummy-Daten im localStorage dieses Browsers.
// TODO: gegen das Directus SDK tauschen, z.B.
//   getEntriesForWeek -> readItems("time_entries", { filter: { user: { _eq: userId }, date: { _between: [from, to] } } })
//   getBookedTaskIds  -> aggregate/groupBy: ["task"] statt alle Einträge zu laden
//   createEntry       -> createItem("time_entries", input)
//   updateEntry       -> updateItem("time_entries", id, changes)
//   deleteEntry       -> deleteItem("time_entries", id)
// Zusätzlich in Directus per Berechtigungsfilter `user = $CURRENT_USER` absichern.
// Die Schnittstelle bleibt gleich, damit sich die UI dabei nicht ändert.

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

const STORAGE_KEY_PREFIX = "project-tracker:time-entries"

function canUseStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window
}

function findEntry(entries: TimeBooking[], id: string): TimeBooking {
  const entry = entries.find((candidate) => candidate.id === id)
  if (!entry) throw new Error(`Zeitbuchung ${id} nicht gefunden`)
  return entry
}

/**
 * Repository für die Buchungen einer Person. Eigener Speicherschlüssel je Person,
 * damit sich auf einem geteilten Browser niemand fremde Einträge ansieht.
 */
export function createTimeBookingRepository(
  userId: string
): TimeBookingRepository {
  const storageKey = `${STORAGE_KEY_PREFIX}:${userId}`

  function readAll(): TimeBooking[] {
    const seed = () => createDummyTimeEntries(new Date(), userId)
    if (!canUseStorage()) return seed()
    try {
      const stored = window.localStorage.getItem(storageKey)
      const parsed: unknown = stored ? JSON.parse(stored) : null
      return Array.isArray(parsed)
        ? (parsed as TimeBooking[]).filter((entry) => entry.user === userId)
        : seed()
    } catch {
      // Kaputte oder gesperrte Daten: mit den Dummy-Daten weiterarbeiten.
      return seed()
    }
  }

  function writeAll(entries: TimeBooking[]): void {
    if (canUseStorage()) {
      window.localStorage.setItem(storageKey, JSON.stringify(entries))
    }
  }

  return {
    async getEntriesForWeek(weekStart) {
      const days = new Set(getWeekDays(weekStart).map(toDayKey))
      return readAll().filter((entry) => days.has(entry.date))
    },

    async getBookedTaskIds() {
      return new Set(readAll().map((entry) => entry.task))
    },

    async createEntry(input) {
      const entry: TimeBooking = { ...input, user: userId, id: crypto.randomUUID() }
      writeAll([...readAll(), entry])
      return entry
    },

    async updateEntry(id, changes) {
      const entries = readAll()
      const updated = { ...findEntry(entries, id), ...changes, user: userId }
      writeAll(entries.map((entry) => (entry.id === id ? updated : entry)))
      return updated
    },

    async deleteEntry(id) {
      const entries = readAll()
      findEntry(entries, id)
      writeAll(entries.filter((entry) => entry.id !== id))
    },
  }
}
