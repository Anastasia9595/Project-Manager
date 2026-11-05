import { useEffect, useState } from "react"

export type OptionsState<T> =
  | { state: "loading" }
  | { state: "error"; forbidden: boolean }
  | { state: "ready"; options: T }

/** Lädt Auswahllisten von `url`; `retry` startet den Abruf nach einem Fehler neu. */
export function useOptions<T>(url: string) {
  const [state, setState] = useState<OptionsState<T>>({ state: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 403) {
          setState({ state: "error", forbidden: true })
          return
        }
        if (!response.ok) throw new Error("options_failed")
        const options = (await response.json()) as T
        setState({ state: "ready", options })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({ state: "error", forbidden: false })
      })
    return () => controller.abort()
  }, [url, attempt])

  function retry() {
    setState({ state: "loading" })
    setAttempt((current) => current + 1)
  }

  return { state, retry }
}
