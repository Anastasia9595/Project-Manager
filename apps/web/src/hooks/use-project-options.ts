import { useOptions, type OptionsState } from "@/hooks/use-options"
import type { ProjectOptions } from "@/services/projects/new-project.types"

export type ProjectOptionsState = OptionsState<ProjectOptions>

/** Lädt die Auswahllisten für "Neues Projekt"; `retry` startet den Abruf nach einem Fehler neu. */
export function useProjectOptions() {
  return useOptions<ProjectOptions>("/api/projects/options")
}
