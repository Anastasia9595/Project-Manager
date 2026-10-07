import type { AstroCookies } from "astro"

import { getSessionTokens, type SessionTokens } from "@/lib/auth/session"
import type { SessionUser } from "@/lib/auth/types"

export type RequestSession = { tokens: SessionTokens; user: SessionUser }

/** Tokens und User der aktuellen Anfrage für Seiten und API-Routen; `null`, wenn nicht angemeldet. */
export function getRequestSession(
  cookies: AstroCookies,
  locals: App.Locals
): RequestSession | null {
  const tokens = getSessionTokens(cookies)
  if (!tokens || !locals.user) return null
  return { tokens, user: locals.user }
}
