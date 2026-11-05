import { toast } from "sonner"

import { setTaskCompleted } from "@/services/tasks/tasks.client"

/**
 * Gibt eine Funktion zurück, die den Erledigt-Status speichert. Schlägt das Speichern fehl,
 * wird `rollback` aufgerufen und ein Toast mit `errorMessage` gezeigt.
 */
export function useTaskCompletion(errorMessage: string) {
  return async function saveCompletion(
    id: string,
    completed: boolean,
    rollback: () => void
  ) {
    try {
      await setTaskCompleted(id, completed)
    } catch {
      rollback()
      toast.error(errorMessage)
    }
  }
}
