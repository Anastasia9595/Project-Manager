import { beforeEach, describe, expect, it, vi } from "vitest"

import { useTaskTimerStore } from "@/lib/task-timer-store"

// Vor dem Import des Stores, sonst findet persist kein localStorage.
const storage = vi.hoisted(() => new Map<string, string>())
vi.hoisted(() => {
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  })
})

beforeEach(() => {
  storage.clear()
  useTaskTimerStore.setState({ active: null, entries: [] })
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 10, 5, 9, 0, 0))
})

describe("task timer store", () => {
  it("stop gibt den fertigen Eintrag zurück und merkt ihn für die Anzeige", () => {
    const { start, stop } = useTaskTimerStore.getState()
    start("t1")
    vi.setSystemTime(new Date(2026, 10, 5, 9, 1, 30))
    const entry = stop()
    expect(entry).toEqual({
      taskId: "t1",
      startedAt: new Date(2026, 10, 5, 9, 0, 0),
      seconds: 90,
    })
    expect(useTaskTimerStore.getState().active).toBeNull()
    expect(useTaskTimerStore.getState().entries).toEqual([entry])
  })

  it("stop ohne laufenden Timer liefert null", () => {
    expect(useTaskTimerStore.getState().stop()).toBeNull()
  })

  it("discardEntry entfernt einen Eintrag wieder", () => {
    const { start, stop, discardEntry } = useTaskTimerStore.getState()
    start("t1")
    const entry = stop()!
    discardEntry(entry)
    expect(useTaskTimerStore.getState().entries).toEqual([])
  })

  it("speichert nur den laufenden Timer, nicht die Einträge", () => {
    const { start, stop } = useTaskTimerStore.getState()
    start("t1")
    stop()
    start("t2")
    const persisted = JSON.parse(storage.get("project-tracker:task-timer")!)
    expect(persisted.state.active.taskId).toBe("t2")
    expect(persisted.state.entries).toBeUndefined()
  })
})
