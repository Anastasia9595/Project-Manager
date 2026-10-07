import { defineMiddleware } from "astro:middleware"
import { isDirectusError, readMe, refresh } from "@directus/sdk"

import { createAuthClient } from "@/lib/auth/directus-auth-client"
import { dedupeByKey } from "@/lib/auth/refresh-lock"
import {
  clearSessionCookies,
  getSessionTokens,
  isPersistentSession,
  setSessionCookies,
} from "@/lib/auth/session"
import type { SessionUser } from "@/lib/auth/types"
import { getFullName } from "@/utils/full-name"

const PUBLIC_PATHS = ["/login"]

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_astro/") ||
    pathname === "/favicon.svg"
  )
}

type MeResponse = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: { name: string } | null
  avatar: string | null
}

async function loadUser(accessToken: string): Promise<SessionUser | null> {
  const client = createAuthClient()
  await client.setToken(accessToken)

  try {
    const me = (await client.request(
      readMe({
        fields: ["id", "email", "first_name", "last_name", "role.name", "avatar"],
      }),
    )) as unknown as MeResponse

    const name = getFullName(me.first_name, me.last_name) || me.email

    return {
      id: me.id,
      email: me.email,
      name,
      role: me.role?.name ?? null,
      avatarId: me.avatar,
    }
  } catch (error) {
    if (isDirectusError(error)) {
      return null
    }
    throw error
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url } = context
  const tokens = getSessionTokens(cookies)

  let user: SessionUser | null = null

  if (tokens) {
    user = await loadUser(tokens.accessToken)

    if (!user) {
      try {
        const refreshed = await dedupeByKey(`refresh:${tokens.refreshToken}`, () =>
          createAuthClient().request(
            refresh({ refresh_token: tokens.refreshToken, mode: "json" }),
          ),
        )

        if (refreshed.access_token && refreshed.refresh_token) {
          setSessionCookies(
            cookies,
            { accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token },
            isPersistentSession(cookies),
          )
          user = await loadUser(refreshed.access_token)
        }
      } catch (error) {
        if (!isDirectusError(error)) {
          throw error
        }
      }
    }

    if (!user) {
      clearSessionCookies(cookies)
    }
  }

  context.locals.user = user

  const pathname = url.pathname
  const isPublic = isPublicPath(pathname)

  if (!user && !isPublic) {
    return context.redirect("/login")
  }

  if (user && pathname === "/login") {
    return context.redirect("/")
  }

  return next()
})
