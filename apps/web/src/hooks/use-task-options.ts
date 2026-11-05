import { useEffect, useState } from "react"

import type { TaskOptions } from "@/services/tasks/new-task.types"

export type TaskOptionsState =
  | { state: "loading" }
  | { state: "error"; forbidden: boolean }
  | { state: "ready"; options: TaskOptions }

/** Lädt Projekte und Vorlagen für "Neue Aufgabe"; `retry` startet den Abruf nach einem Fehler neu. */
export function useTaskOptions() {
  const [state, setState] = useState<TaskOptionsState>({ state: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/tasks/options", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 403) {
          setState({ state: "error", forbidden: true })
          return
        }
        if (!response.ok) throw new Error("options_failed")
        const options = (await response.json()) as TaskOptions
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
