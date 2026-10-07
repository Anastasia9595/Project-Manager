import { useState } from "react"

export type SaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "success" }
  | { state: "error"; code: string }

/** Sendet JSON an eine API-Route und hält den Zustand für die Statusmeldung. */
export function useSaveRequest(url: string, method: "PATCH" | "POST") {
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" })

  async function send(body: Record<string, unknown>): Promise<boolean> {
    setStatus({ state: "saving" })
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        setStatus({ state: "success" })
        return true
      }
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setStatus({ state: "error", code: data?.error ?? "server_error" })
    } catch {
      setStatus({ state: "error", code: "server_error" })
    }
    return false
  }

  return { status, send, setStatus }
}
