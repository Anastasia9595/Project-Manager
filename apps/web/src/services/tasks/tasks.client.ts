import { SUBMIT_TIMEOUT_MS } from "@/lib/customer-contact-form/submit"
import type { TaskValidationErrors } from "./new-task.validation"
import type { NewTaskValues } from "./new-task.values"

export type SubmitTaskResult =
  | { ok: true; id: string; name: string }
  | {
      ok: false
      /** Fehlercode der API, z. B. "forbidden", oder "network_error" bei Netzwerkfehler und Zeitüberschreitung. */
      error: string
      /** Feldfehler des Servers bei `invalid_fields`. */
      fields?: TaskValidationErrors
    }

/** Sendet die neue Aufgabe an die API und gibt Id und Name oder den Fehlercode samt Feldfehlern zurück. */
export async function submitNewTask(
  values: NewTaskValues
): Promise<SubmitTaskResult> {
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
    })
    const data = (await response.json().catch(() => null)) as {
      id?: string
      name?: string
      error?: string
      fields?: TaskValidationErrors
    } | null

    if (response.ok && data?.id) {
      return { ok: true, id: data.id, name: data.name ?? values.name.trim() }
    }
    return {
      ok: false,
      error: data?.error ?? "server_error",
      fields: data?.fields,
    }
  } catch {
    return { ok: false, error: "network_error" }
  }
}

/** Speichert den Erledigt-Status einer Aufgabe; wirft bei Fehlern, damit die Oberfläche zurücksetzen kann. */
export async function setTaskCompleted(
  id: string,
  completed: boolean
): Promise<void> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  })
  if (!response.ok)
    throw new Error(
      `Aufgabe konnte nicht gespeichert werden (${response.status})`
    )
}
