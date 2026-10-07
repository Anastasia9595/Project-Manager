import { isDirectusError } from "@directus/sdk"

import { withSession } from "@/lib/auth/with-session"
import { updateProfile } from "@/lib/profile"
import { isProfileValues } from "@/lib/profile-fields"
import { validateProfile } from "@/lib/profile-validation"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

export const PATCH = withSession(async ({ request }, session) => {
  const body = await readJsonBody<unknown>(request)
  if (!isProfileValues(body)) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const fields = validateProfile(body)
  if (Object.keys(fields).length > 0) {
    return jsonResponse(400, { error: "invalid_fields", fields })
  }

  try {
    await updateProfile(session.tokens.accessToken, body)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    if (isDirectusError(error)) {
      console.error("Directus profile update failed", error)
      return jsonResponse(400, { error: "update_failed" })
    }
    throw error
  }
})
