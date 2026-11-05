import { useOptions, type OptionsState } from "@/hooks/use-options"
import type { TaskOptions } from "@/services/tasks/new-task.types"

export type TaskOptionsState = OptionsState<TaskOptions>

/** Lädt Projekte und Vorlagen für "Neue Aufgabe"; `retry` startet den Abruf nach einem Fehler neu. */
export function useTaskOptions() {
  return useOptions<TaskOptions>("/api/tasks/options")
}
