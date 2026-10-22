import { isDirectusError } from "@directus/sdk"

import { isCustomerContactValues } from "@/lib/customer-contact-form/fields"
import { createTenantUser } from "@/lib/customer-contact-form/repository"
import { validateCustomerContact } from "@/lib/customer-contact-form/validation"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

/** Logik der Route POST /api/customer-contacts; die Session prüft die Route selbst. */
export async function handleCreateContact(request: Request): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isCustomerContactValues(body)) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const fields = validateCustomerContact(body)
  if (Object.keys(fields).length > 0) {
    return jsonResponse(400, { error: "invalid_fields", fields })
  }

  try {
    await createTenantUser(body)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    if (isDirectusError(error)) {
      console.error("Directus customer contact create failed", error)
      return jsonResponse(400, { error: "create_failed" })
    }
    throw error
  }
}
