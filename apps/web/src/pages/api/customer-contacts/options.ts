import { withSession } from "@/lib/auth/with-session"
import { toErrorResponse } from "@/lib/customer-contact-form/error-response"
import { fetchContactOptions } from "@/lib/customer-contact-form/repository"
import { jsonResponse } from "@/utils/json-response"

export const GET = withSession(async (_context, session) => {
  try {
    return jsonResponse(
      200,
      await fetchContactOptions(session.tokens.accessToken)
    )
  } catch (error) {
    return toErrorResponse(
      error,
      "Directus contact options",
      "options_failed"
    )
  }
})
