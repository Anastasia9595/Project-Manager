import { isDirectusError } from "@directus/sdk"

import { jsonResponse } from "@/utils/json-response"

/** HTTP-Status einer Directus-Antwort; `undefined` bei Netzwerkfehlern und fremden Fehlern. */
export function getDirectusStatus(error: unknown): number | undefined {
  if (!isDirectusError(error)) return undefined
  return (error as { response?: { status?: number } }).response?.status
}

// Statuscodes, bei denen Directus die Eingabe selbst ablehnt. Alles andere
// (404, 408, 429, 5xx, ...) ist aus Sicht der Person ein Ausfall und kann erneut versucht werden.
const REJECTED_STATUSES = new Set([400, 409, 422])

/**
 * Wandelt einen Fehler aus Directus in eine JSON-Antwort um.
 * Geloggt werden nur Status und Fehlercodes: Directus-Fehler können die Eingaben
 * (Name, E-Mail, Telefon) enthalten, die nicht ins Log gehören.
 */
export function toErrorResponse(
  error: unknown,
  context: string,
  rejectedCode: string
): Response {
  if (isDirectusError(error)) {
    const status = getDirectusStatus(error)
    const codes = error.errors.map((item) => item.extensions?.code)
    console.error(`${context} failed`, { status, codes })

    if (status === 401) return jsonResponse(401, { error: "unauthorized" })
    if (status === 403) return jsonResponse(403, { error: "forbidden" })
    if (status !== undefined && REJECTED_STATUSES.has(status)) {
      return jsonResponse(400, { error: rejectedCode })
    }
    return jsonResponse(502, { error: "unavailable" })
  }

  // Netzwerkfehler o. Ä.: nur die Meldung loggen, nicht das ganze Objekt.
  console.error(
    `${context} failed`,
    error instanceof Error ? error.message : "unknown error"
  )
  return jsonResponse(502, { error: "unavailable" })
}
