import { useEffect, useMemo } from "react"

import { getStartedTaskIds } from "@/lib/calendar/entries"
import { rehydrateTaskTimer, useTaskTimerStore } from "@/lib/task-timer-store"
import type { TrackedTask } from "@/models/task"

/**
 * Aufgaben „In Bearbeitung“ aus beiden Quellen: Zeitbuchungen (`bookedTaskIds`)
 * und Timer der Aufgaben-Seite (inkl. laufendem Timer).
 */
export function useStartedTaskIds(
  tasks: TrackedTask[],
  bookedTaskIds: ReadonlySet<string>
): ReadonlySet<string> {
  const timerEntries = useTaskTimerStore((state) => state.entries)
  const activeTaskId = useTaskTimerStore((state) => state.active?.taskId ?? null)
  // Gespeicherten Timer erst nach dem Mount laden (siehe task-timer-store).
  useEffect(() => rehydrateTaskTimer(), [])

  return useMemo(
    () =>
      new Set([
        ...getStartedTaskIds(tasks, timerEntries, activeTaskId),
        ...bookedTaskIds,
      ]),
    [tasks, timerEntries, activeTaskId, bookedTaskIds]
  )
}
