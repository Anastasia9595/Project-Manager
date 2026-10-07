import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { TimeEntry } from "@/models/task"

// TODO: Zeiteinträge in Directus speichern - aktuell nur im localStorage dieses Browsers.
// Der Store ist global: es darf immer nur genau ein Timer laufen, egal wie viele
// Komponenten ihn anzeigen.

export type ActiveTimer = {
  taskId: string
  startedAt: number
}

type TaskTimerState = {
  active: ActiveTimer | null
  /** Per Timer gebuchte Einträge (zusätzlich zu denen aus den Aufgabendaten). */
  entries: TimeEntry[]
  /** Startet den Timer - wird ignoriert, solange bereits ein Timer läuft. */
  start: (taskId: string) => void
  /** Stoppt den laufenden Timer und bucht die Dauer auf dessen Aufgabe. */
  stop: () => void
}

const STORAGE_KEY = "project-tracker:task-timer"

export const useTaskTimerStore = create<TaskTimerState>()(
  persist(
    (set, get) => ({
      active: null,
      entries: [],
      start: (taskId) => {
        if (get().active) return
        set({ active: { taskId, startedAt: Date.now() } })
      },
      stop: () => {
        const { active, entries } = get()
        if (!active) return
        const seconds = Math.max(
          0,
          Math.round((Date.now() - active.startedAt) / 1000)
        )
        set({
          active: null,
          entries: [
            ...entries,
            {
              taskId: active.taskId,
              startedAt: new Date(active.startedAt),
              seconds,
            },
          ],
        })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage, {
        // Dates werden als ISO-String gespeichert und hier wieder zu Date.
        reviver: (key, value) =>
          key === "startedAt" && typeof value === "string"
            ? new Date(value)
            : value,
      }),
      partialize: ({ active, entries }) => ({ active, entries }),
      // Erst im Browser nach dem Hydrieren laden (siehe `rehydrateTaskTimer`),
      // sonst weicht das Client-Rendering vom Server-HTML ab.
      skipHydration: true,
    }
  )
)

/** Lädt den gespeicherten Timer nach dem Mount und hält mehrere Tabs synchron. */
export function rehydrateTaskTimer(): () => void {
  void useTaskTimerStore.persist.rehydrate()
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) void useTaskTimerStore.persist.rehydrate()
  }
  window.addEventListener("storage", onStorage)
  return () => window.removeEventListener("storage", onStorage)
}
