import type { AstroCookies } from "astro"

const ACCESS_COOKIE = "sb_access"
const REFRESH_COOKIE = "sb_refresh"
const REMEMBER_COOKIE = "sb_remember"
// Directus-Default fuer die Lebensdauer des Refresh-Tokens (7 Tage).
// Der Access-Token wird bei jedem Request ohnehin per Directus validiert
// bzw. ueber den Refresh-Token erneuert, die Cookie-Laufzeit ist nur eine
// Obergrenze dafuer, wie lange der Browser das Cookie ueberhaupt sendet.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export type SessionTokens = {
  accessToken: string
  refreshToken: string
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax" as const,
    path: "/",
  }
}

function cookieOptions(persistent: boolean) {
  return persistent
    ? { ...baseCookieOptions(), maxAge: COOKIE_MAX_AGE_SECONDS }
    : baseCookieOptions()
}

export function setSessionCookies(
  cookies: AstroCookies,
  tokens: SessionTokens,
  persistent: boolean,
): void {
  const options = cookieOptions(persistent)
  cookies.set(ACCESS_COOKIE, tokens.accessToken, options)
  cookies.set(REFRESH_COOKIE, tokens.refreshToken, options)

  if (persistent) {
    cookies.set(REMEMBER_COOKIE, "1", options)
  } else {
    cookies.delete(REMEMBER_COOKIE, baseCookieOptions())
  }
}

export function isPersistentSession(cookies: AstroCookies): boolean {
  return cookies.get(REMEMBER_COOKIE)?.value === "1"
}

export function getSessionTokens(cookies: AstroCookies): SessionTokens | null {
  const accessToken = cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = cookies.get(REFRESH_COOKIE)?.value

  if (!accessToken || !refreshToken) {
    return null
  }

  return { accessToken, refreshToken }
}

export function clearSessionCookies(cookies: AstroCookies): void {
  const options = baseCookieOptions()
  cookies.delete(ACCESS_COOKIE, options)
  cookies.delete(REFRESH_COOKIE, options)
  cookies.delete(REMEMBER_COOKIE, options)
}
