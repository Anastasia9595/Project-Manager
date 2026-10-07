import { isDirectusError } from "@directus/sdk"

import { withSession } from "@/lib/auth/with-session"
import { changePassword } from "@/lib/profile"
import { validatePasswordChange } from "@/lib/profile-validation"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

type PasswordBody = { currentPassword?: string; newPassword?: string }

export const POST = withSession(async ({ request }, session) => {
  const body = await readJsonBody<PasswordBody>(request)
  if (!body?.currentPassword || !body.newPassword) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const fields = validatePasswordChange({ next: body.newPassword })
  if (Object.keys(fields).length > 0) {
    return jsonResponse(400, { error: "invalid_fields", fields })
  }

  try {
    await changePassword(
      session.tokens.accessToken,
      session.user.email,
      body.currentPassword,
      body.newPassword
    )
    return jsonResponse(200, { ok: true })
  } catch (error) {
    if (isDirectusError(error)) {
      const code = error.errors[0]?.extensions?.code
      return jsonResponse(400, {
        error: code === "INVALID_CREDENTIALS" ? "invalid_current" : "rejected",
      })
    }
    throw error
  }
})
