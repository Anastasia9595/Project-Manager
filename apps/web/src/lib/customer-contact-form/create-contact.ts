import { isCustomerContactValues } from "@/lib/customer-contact-form/fields"
import {
  getDirectusStatus,
  toErrorResponse,
} from "@/lib/customer-contact-form/error-response"
import {
  createTenantUser,
  fetchLocationTenant,
} from "@/lib/customer-contact-form/repository"
import { validateCustomerContact } from "@/lib/customer-contact-form/validation"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

/**
 * Prüft, ob der Standort zum gewählten Kunden gehört. Das Formular zeigt nur passende
 * Standorte; hier gilt dieselbe Regel für manipulierte Anfragen. Ein Standort, den es nicht
 * gibt oder den die Person nicht lesen darf (Directus antwortet 403 oder 404), gilt als ungültig.
 * Gibt eine Fehlerantwort zurück oder `null`, wenn alles passt.
 */
async function checkLocation(
  accessToken: string,
  tenantId: string,
  locationId: string
): Promise<Response | null> {
  try {
    const locationTenant = await fetchLocationTenant(accessToken, locationId)
    return locationTenant === tenantId
      ? null
      : jsonResponse(400, { error: "invalid_location" })
  } catch (error) {
    const status = getDirectusStatus(error)
    if (status === 403 || status === 404) {
      return jsonResponse(400, { error: "invalid_location" })
    }
    return toErrorResponse(error, "Directus location check", "invalid_location")
  }
}

/**
 * Logik der Route POST /api/customer-contacts. Die Route prüft, dass jemand angemeldet ist;
 * was die Person anlegen darf, entscheiden die Directus-Rechte über ihren `accessToken`.
 */
export async function handleCreateContact(
  request: Request,
  accessToken: string
): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isCustomerContactValues(body)) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const fields = validateCustomerContact(body)
  if (Object.keys(fields).length > 0) {
    return jsonResponse(400, { error: "invalid_fields", fields })
  }

  if (body.locationId) {
    const rejection = await checkLocation(
      accessToken,
      body.tenantId,
      body.locationId
    )
    if (rejection) return rejection
  }

  try {
    await createTenantUser(accessToken, body)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    return toErrorResponse(error, "Directus customer contact create", "create_failed")
  }
}
