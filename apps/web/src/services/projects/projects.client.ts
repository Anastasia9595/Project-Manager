import { SUBMIT_TIMEOUT_MS } from "@/lib/customer-contact-form/submit"
import type { ProjectValidationErrors } from "./new-project.validation"
import type { NewProjectValues } from "./new-project.values"

export type SubmitProjectResult =
  | { ok: true; id: string; name: string }
  | {
      ok: false
      /** Fehlercode der API, z. B. "forbidden", oder "network_error" bei Netzwerkfehler und Zeitüberschreitung. */
      error: string
      /** Feldfehler des Servers bei `invalid_fields`. */
      fields?: ProjectValidationErrors
    }

/** Sendet das neue Projekt an die API und gibt Id und Name oder den Fehlercode samt Feldfehlern zurück. */
export async function submitNewProject(
  values: NewProjectValues
): Promise<SubmitProjectResult> {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
    })
    const data = (await response.json().catch(() => null)) as {
      id?: string
      name?: string
      error?: string
      fields?: ProjectValidationErrors
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
