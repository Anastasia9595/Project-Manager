import type { CustomerContactValues } from "@/lib/customer-contact-form/fields"
import type { ContactValidationErrors } from "@/lib/customer-contact-form/validation"

export type SubmitResult =
  | { ok: true }
  | {
      ok: false
      /** Fehlercode der API, z. B. "forbidden", oder "network_error" bei Netzwerkfehler und Zeitüberschreitung. */
      error: string
      /** Feldfehler des Servers bei `invalid_fields`. */
      fields?: ContactValidationErrors
    }

/** Nach dieser Zeit gilt das Speichern als fehlgeschlagen, damit der Dialog nicht dauerhaft gesperrt bleibt. */
export const SUBMIT_TIMEOUT_MS = 20_000

/** Sendet die Kontaktperson an die API und gibt Erfolg oder den Fehlercode samt Feldfehlern zurück. */
export async function submitCustomerContact(
  values: CustomerContactValues
): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/customer-contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
    })
    if (response.ok) return { ok: true }

    const data = (await response.json().catch(() => null)) as {
      error?: string
      fields?: ContactValidationErrors
    } | null
    return {
      ok: false,
      error: data?.error ?? "server_error",
      fields: data?.fields,
    }
  } catch {
    return { ok: false, error: "network_error" }
  }
}
