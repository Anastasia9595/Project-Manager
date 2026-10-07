import type { APIRoute } from "astro"
import { logout } from "@directus/sdk"

import { createAuthClient } from "@/lib/auth/directus-auth-client"
import { clearSessionCookies, getSessionTokens } from "@/lib/auth/session"
import { jsonResponse } from "@/utils/json-response"

export const POST: APIRoute = async ({ cookies }) => {
  const tokens = getSessionTokens(cookies)

  if (tokens) {
    const client = createAuthClient()
    try {
      await client.request(logout({ refresh_token: tokens.refreshToken, mode: "json" }))
    } catch (error) {
      console.error("Directus logout failed", error)
    }
  }

  clearSessionCookies(cookies)

  return jsonResponse(200, { ok: true })
}
