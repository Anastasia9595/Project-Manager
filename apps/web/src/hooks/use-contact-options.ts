import { useEffect, useState } from "react"

import type { ContactOptions } from "@/lib/customer-contact-form/repository"

export type ContactOptionsState =
  | { state: "loading" }
  | { state: "error"; forbidden: boolean }
  | { state: "ready"; options: ContactOptions }

/** Lädt Kunden und Standorte für das Kontaktformular; `retry` startet den Abruf nach einem Fehler neu. */
export function useContactOptions() {
  const [state, setState] = useState<ContactOptionsState>({ state: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/customer-contacts/options", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 403) {
          setState({ state: "error", forbidden: true })
          return
        }
        if (!response.ok) throw new Error("options_failed")
        const options = (await response.json()) as ContactOptions
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
