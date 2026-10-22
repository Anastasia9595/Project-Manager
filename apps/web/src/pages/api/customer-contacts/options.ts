import { withSession } from "@/lib/auth/with-session"
import { fetchContactOptions } from "@/lib/customer-contact-form/repository"
import { jsonResponse } from "@/utils/json-response"

export const GET = withSession(async () => {
  try {
    return jsonResponse(200, await fetchContactOptions())
  } catch (error) {
    console.error("Directus contact options failed", error)
    return jsonResponse(502, { error: "options_failed" })
  }
})
