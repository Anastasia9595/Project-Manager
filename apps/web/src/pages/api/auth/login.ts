import type { APIRoute } from "astro"
import { isDirectusError } from "@directus/sdk"

import { createAuthClient } from "@/lib/auth/directus-auth-client"
import { setSessionCookies } from "@/lib/auth/session"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

type LoginBody = {
  email?: string
  password?: string
  remember?: boolean
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await readJsonBody<LoginBody>(request)
  const { email, password, remember = true } = body ?? {}
  if (!email || !password) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const client = createAuthClient()

  try {
    const auth = await client.login({ email, password }, { mode: "json" })

    if (!auth.access_token || !auth.refresh_token) {
      throw new Error("Directus login response is missing tokens")
    }

    setSessionCookies(
      cookies,
      { accessToken: auth.access_token, refreshToken: auth.refresh_token },
      remember,
    )

    return jsonResponse(200, { ok: true })
  } catch (error) {
    if (isDirectusError(error) && error.errors[0]?.extensions.code === "INVALID_CREDENTIALS") {
      return jsonResponse(401, { error: "invalid_credentials" })
    }

    console.error("Directus login failed", error)
    return jsonResponse(500, { error: "server_error" })
  }
}
