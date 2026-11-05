import { toast } from "sonner"

import { useTaskTimerStore } from "@/lib/task-timer-store"
import { bookTimerEntry } from "@/services/time-entries/time-entries.client"

/** Stoppt den Timer und bucht die Zeit nach Directus; bei einem Fehler wird der Eintrag verworfen und ein Toast gezeigt. */
export function useStopTimer(errorMessage: string) {
  return function stopTimer() {
    const { stop, discardEntry } = useTaskTimerStore.getState()
    const entry = stop()
    if (!entry) return
    bookTimerEntry(entry).catch(() => {
      discardEntry(entry)
      toast.error(errorMessage)
    })
  }
}
