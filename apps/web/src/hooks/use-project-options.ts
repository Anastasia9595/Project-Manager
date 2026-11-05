import { useEffect, useState } from "react"

import type { ProjectOptions } from "@/services/projects/new-project.types"

export type ProjectOptionsState =
  | { state: "loading" }
  | { state: "error"; forbidden: boolean }
  | { state: "ready"; options: ProjectOptions }

/** Lädt die Auswahllisten für "Neues Projekt"; `retry` startet den Abruf nach einem Fehler neu. */
export function useProjectOptions() {
  const [state, setState] = useState<ProjectOptionsState>({ state: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/projects/options", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 403) {
          setState({ state: "error", forbidden: true })
          return
        }
        if (!response.ok) throw new Error("options_failed")
        const options = (await response.json()) as ProjectOptions
        setState({ state: "ready", options })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({ state: "error", forbidden: false })
      })
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setState({ state: "loading" })
    setAttempt((current) => current + 1)
  }

  return { state, retry }
}
