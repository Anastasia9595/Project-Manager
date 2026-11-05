import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { TimeEntry } from "@/models/task"

// Der laufende Timer liegt im Browser; fertige Einträge speichert der Aufrufer in Directus (siehe useStopTimer).
// Der Store ist global: es darf immer nur genau ein Timer laufen, egal wie viele
// Komponenten ihn anzeigen.

export type ActiveTimer = {
  taskId: string
  startedAt: number
}

type TaskTimerState = {
  active: ActiveTimer | null
  /** Sitzungszustand: in dieser Sitzung beendete Einträge für die sofortige Anzeige; nach dem Neuladen kommen sie aus Directus. */
  entries: TimeEntry[]
  /** Startet den Timer - wird ignoriert, solange bereits ein Timer läuft. */
  start: (taskId: string) => void
  /** Stoppt den laufenden Timer und gibt den fertigen Eintrag zurück (null, wenn keiner lief). */
  stop: () => TimeEntry | null
  /** Entfernt einen Eintrag wieder, z. B. wenn das Buchen fehlgeschlagen ist. */
  discardEntry: (entry: TimeEntry) => void
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
        if (!active) return null
        const seconds = Math.max(
          0,
          Math.round((Date.now() - active.startedAt) / 1000)
        )
        const entry = {
          taskId: active.taskId,
          startedAt: new Date(active.startedAt),
          seconds,
        }
        set({ active: null, entries: [...entries, entry] })
        return entry
      },
      discardEntry: (entry) =>
        set({ entries: get().entries.filter((item) => item !== entry) }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      // Alte gespeicherte Einträge verwerfen, sie liegen jetzt in Directus.
      migrate: (state) => ({
        active: (state as { active?: ActiveTimer | null }).active ?? null,
      }),
      storage: createJSONStorage(() => localStorage, {
        // Dates werden als ISO-String gespeichert und hier wieder zu Date.
        reviver: (key, value) =>
          key === "startedAt" && typeof value === "string"
            ? new Date(value)
            : value,
      }),
      partialize: ({ active }) => ({ active }),
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
