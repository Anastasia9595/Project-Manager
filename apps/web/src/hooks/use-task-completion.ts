import { useRef } from "react"
import { toast } from "sonner"

import { createLatestRequestTracker } from "@/lib/latest-request"
import { setTaskCompleted } from "@/services/tasks/tasks.client"

/**
 * Gibt eine Funktion zurück, die den Erledigt-Status speichert. Schlägt das Speichern fehl,
 * wird `rollback` aufgerufen und ein Toast mit `errorMessage` gezeigt – aber nur für den
 * neuesten Speicherversuch je Aufgabe, damit ein veralteter Fehler keinen neueren Stand überschreibt.
 */
export function useTaskCompletion(errorMessage: string) {
  const tracker = useRef(createLatestRequestTracker()).current
  return async function saveCompletion(
    id: string,
    completed: boolean,
    rollback: () => void
  ) {
    const ticket = tracker.begin(id)
    try {
      await setTaskCompleted(id, completed)
    } catch {
      if (!tracker.isLatest(id, ticket)) return
      rollback()
      toast.error(errorMessage)
    }
  }
}
