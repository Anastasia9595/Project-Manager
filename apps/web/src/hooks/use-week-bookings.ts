import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { createTimeBookingRepository } from "@/lib/time-tracking/repository"
import { entriesOn } from "@/lib/time-tracking/calculations/totals"
import { parseDayKey, startOfWeek, toDayKey } from "@/lib/week"
import type { TimeBooking, TimeBookingInput } from "@/models/time-booking"

type BookingsState = {
  /** Buchungen der angezeigten Woche. */
  entries: TimeBooking[]
  /** Buchungen von heute – auch wenn gerade eine andere Woche angezeigt wird. */
  todayEntries: TimeBooking[]
  bookedTaskIds: Set<string>
  /** false bis zum ersten Laden – erst im Browser, weil die Daten im localStorage liegen. */
  loaded: boolean
}

const INITIAL_STATE: BookingsState = {
  entries: [],
  todayEntries: [],
  bookedTaskIds: new Set(),
  loaded: false,
}

/** Lädt die Buchungen einer Person über das Repository und lädt nach jeder Änderung neu. */
export function useWeekBookings(userId: string, weekStart: Date, today: Date) {
  const repository = useMemo(() => createTimeBookingRepository(userId), [userId])
  const [state, setState] = useState(INITIAL_STATE)
  const weekKey = toDayKey(weekStart)
  const todayKey = toDayKey(today)

  const loadSnapshot = useCallback(async (): Promise<BookingsState> => {
    const day = parseDayKey(todayKey)
    const todayWeekKey = toDayKey(startOfWeek(day))
    const [entries, todayWeekEntries, bookedTaskIds] = await Promise.all([
      repository.getEntriesForWeek(parseDayKey(weekKey)),
      // Die Woche von heute nur extra laden, wenn gerade eine andere angezeigt wird.
      todayWeekKey === weekKey
        ? null
        : repository.getEntriesForWeek(parseDayKey(todayWeekKey)),
      repository.getBookedTaskIds(),
    ])
    return {
      entries,
      todayEntries: entriesOn(todayWeekEntries ?? entries, day),
      bookedTaskIds,
      loaded: true,
    }
  }, [repository, weekKey, todayKey])

  // Jede Anfrage bekommt eine Nummer; übernommen wird nur die neueste Antwort.
  // So überschreibt z.B. ein „Rückgängig“ aus einem älteren Toast nach einem
  // Wochenwechsel nicht die gerade angezeigte Woche mit alten Daten.
  const latestRequest = useRef(0)
  const latestLoad = useRef(loadSnapshot)

  useEffect(() => {
    latestLoad.current = loadSnapshot
    const request = ++latestRequest.current
    void loadSnapshot().then((next) => {
      if (request === latestRequest.current) setState(next)
    })
  }, [loadSnapshot])

  /** Nach Änderungen neu laden – immer für die aktuell angezeigte Woche. */
  async function reload() {
    const request = ++latestRequest.current
    const next = await latestLoad.current()
    if (request === latestRequest.current) setState(next)
  }

  async function create(input: TimeBookingInput): Promise<TimeBooking> {
    const entry = await repository.createEntry(input)
    await reload()
    return entry
  }

  async function update(
    id: string,
    changes: Partial<TimeBookingInput>
  ): Promise<TimeBooking> {
    const entry = await repository.updateEntry(id, changes)
    await reload()
    return entry
  }

  async function remove(id: string): Promise<void> {
    await repository.deleteEntry(id)
    await reload()
  }

  return { ...state, create, update, remove }
}
