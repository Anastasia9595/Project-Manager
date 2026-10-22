import { isCustomerContactValues } from "@/lib/customer-contact-form/fields"
import { toErrorResponse } from "@/lib/customer-contact-form/error-response"
import {
  createTenantUser,
  fetchLocationTenant,
} from "@/lib/customer-contact-form/repository"
import { validateCustomerContact } from "@/lib/customer-contact-form/validation"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

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

  try {
    // Das Formular zeigt nur Standorte des gewählten Kunden; hier gilt dieselbe Regel für manipulierte Anfragen.
    if (body.locationId) {
      const locationTenant = await fetchLocationTenant(
        accessToken,
        body.locationId
      )
      if (locationTenant !== body.tenantId) {
        return jsonResponse(400, { error: "invalid_location" })
      }
    }

    await createTenantUser(accessToken, body)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    return toErrorResponse(error, "Directus customer contact create", "create_failed")
  }
}
