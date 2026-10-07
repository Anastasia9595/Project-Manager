# Directus Login mit rollenbasierter Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Echtes Login gegen Directus für drei Rollen (Administrator, Agentur Mitarbeiter, Kunden), mit serverseitiger Session (httpOnly-Cookies) und rollenbasiert gefilterter Sidebar.

**Architecture:** Astro läuft SSR (`output: server`, `@astrojs/node` standalone). Login/Refresh/Logout laufen ausschließlich serverseitig über Astro-API-Routen und einen frischen Directus-Auth-Client pro Request. Eine Astro-Middleware liest/erneuert die Session bei jedem Request, schützt alle Routen außer `/login` und legt den eingeloggten Nutzer in `Astro.locals.user` ab. Die Rolle steuert rein clientseitig, welche Sidebar-Einträge gerendert werden — Datenrechte pro Collection regelt Directus selbst über die Rolle des Nutzers.

**Tech Stack:** Astro 7 (SSR, Node-Adapter), React 19 (Inseln via `@astrojs/react`), `@directus/sdk` 25, Tailwind (via `@workspace/ui`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-17-directus-login-design.md`
- Directus-Rollennamen exakt wie in der Instanz: `Administrator`, `Agentur Mitarbeiter`, `Kunden` (Groß-/Kleinschreibung und Leerzeichen exakt übernehmen).
- Session-Cookies heißen `sb_access` / `sb_refresh`, `httpOnly`, `sameSite: "lax"`, `path: "/"`, `secure` nur wenn `import.meta.env.PROD`.
- Kein Test-Framework im Repo (nur `astro check` / `eslint`) — Verifikation läuft über `npm run --workspace=web typecheck`, gezielte `curl`-Checks gegen den Dev-Server und einen abschließenden manuellen Check durch den Nutzer mit echten Accounts.
- Import-Alias `@/*` zeigt auf `apps/web/src/*` (siehe `apps/web/tsconfig.json`).
- Bestehender Stil beachten: Dateien in `src/components/` importieren `../i18n` relativ; neue Dateien außerhalb von `src/components/` nutzen den `@/`-Alias.
- Alle Commit-Messages enden mit `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

---

### Task 1: Session- und Directus-Auth-Client-Infrastruktur

**Files:**
- Create: `apps/web/src/lib/auth/types.ts`
- Create: `apps/web/src/lib/auth/session.ts`
- Create: `apps/web/src/lib/auth/directus-auth-client.ts`

**Interfaces:**
- Produces: `SessionUser` (`{ id: string; email: string; name: string; role: string | null }`) aus `@/lib/auth/types`
- Produces: `SessionTokens` (`{ accessToken: string; refreshToken: string }`), `setSessionCookies(cookies: AstroCookies, tokens: SessionTokens): void`, `getSessionTokens(cookies: AstroCookies): SessionTokens | null`, `clearSessionCookies(cookies: AstroCookies): void` aus `@/lib/auth/session`
- Produces: `createAuthClient(): DirectusClient` (ein per-Request-Client mit `authentication("json", { autoRefresh: false })` + `rest()`) aus `@/lib/auth/directus-auth-client`
- Consumes: `import.meta.env.DIRECTUS_URL` (bereits in `apps/web/.env` gesetzt, siehe `apps/web/src/lib/directus.ts` für das bestehende Muster)

- [ ] **Step 1: `types.ts` anlegen**

```ts
// apps/web/src/lib/auth/types.ts
export type SessionUser = {
  id: string
  email: string
  name: string
  role: string | null
}
```

- [ ] **Step 2: `session.ts` anlegen**

```ts
// apps/web/src/lib/auth/session.ts
import type { AstroCookies } from "astro"

const ACCESS_COOKIE = "sb_access"
const REFRESH_COOKIE = "sb_refresh"
// Directus-Default fuer die Lebensdauer des Refresh-Tokens (7 Tage).
// Der Access-Token wird bei jedem Request ohnehin per Directus validiert
// bzw. ueber den Refresh-Token erneuert, die Cookie-Laufzeit ist nur eine
// Obergrenze dafuer, wie lange der Browser das Cookie ueberhaupt sendet.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export type SessionTokens = {
  accessToken: string
  refreshToken: string
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  }
}

export function setSessionCookies(cookies: AstroCookies, tokens: SessionTokens): void {
  cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions())
  cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions())
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
  cookies.delete(ACCESS_COOKIE, { path: "/" })
  cookies.delete(REFRESH_COOKIE, { path: "/" })
}
```

- [ ] **Step 3: `directus-auth-client.ts` anlegen**

```ts
// apps/web/src/lib/auth/directus-auth-client.ts
import { authentication, createDirectus, rest } from "@directus/sdk"

const url = import.meta.env.DIRECTUS_URL

if (!url) {
  throw new Error("Missing Directus environment variable: DIRECTUS_URL")
}

// Ein frischer Client pro Login/Refresh/Logout-Aufruf statt eines
// Singletons: jeder Request bringt sein eigenes Token-Paar mit, ein
// geteilter Client wuerde Sessions verschiedener Nutzer vermischen.
export function createAuthClient() {
  return createDirectus(url).with(authentication("json", { autoRefresh: false })).with(rest())
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run --workspace=web typecheck`
Expected: `0 errors`, `0 warnings`, `0 hints`

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/auth/types.ts apps/web/src/lib/auth/session.ts apps/web/src/lib/auth/directus-auth-client.ts
git commit -m "$(cat <<'EOF'
feat: add session cookie helpers and Directus auth client factory

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Rollen- und Sidebar-Sichtbarkeitskonfiguration

**Files:**
- Create: `apps/web/src/lib/auth/roles.ts`

**Interfaces:**
- Produces: `ROLES` (Objekt mit `ADMIN`, `MITARBEITER`, `KUNDE`), `SidebarKey` (`"dashboard" | "projects" | "tasks" | "timeTracking" | "calendar" | "settings"`), `visibleSidebarKeys(role: string | null | undefined): SidebarKey[]` aus `@/lib/auth/roles`
- Consumes: nichts (steht für sich)

- [ ] **Step 1: `roles.ts` anlegen**

```ts
// apps/web/src/lib/auth/roles.ts
export const ROLES = {
  ADMIN: "Administrator",
  MITARBEITER: "Agentur Mitarbeiter",
  KUNDE: "Kunden",
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export type SidebarKey =
  | "dashboard"
  | "projects"
  | "tasks"
  | "timeTracking"
  | "calendar"
  | "settings"

const ALL_KEYS: SidebarKey[] = [
  "dashboard",
  "projects",
  "tasks",
  "timeTracking",
  "calendar",
  "settings",
]

const SIDEBAR_VISIBILITY: Record<RoleName, SidebarKey[]> = {
  [ROLES.ADMIN]: ALL_KEYS,
  [ROLES.MITARBEITER]: ["dashboard", "projects", "tasks", "timeTracking", "calendar"],
  [ROLES.KUNDE]: ["dashboard", "projects", "tasks"],
}

// Fail-closed: unbekannte oder fehlende Rolle sieht nur das Dashboard.
export function visibleSidebarKeys(role: string | null | undefined): SidebarKey[] {
  if (role && role in SIDEBAR_VISIBILITY) {
    return SIDEBAR_VISIBILITY[role as RoleName]
  }
  return ["dashboard"]
}
```

- [ ] **Step 2: Verhalten manuell gegenprüfen**

Run: `node -e "
const ts = require('typescript');
const src = require('fs').readFileSync('apps/web/src/lib/auth/roles.ts', 'utf8');
const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', out)(mod, mod.exports);
console.log('Administrator:', mod.exports.visibleSidebarKeys('Administrator'));
console.log('Agentur Mitarbeiter:', mod.exports.visibleSidebarKeys('Agentur Mitarbeiter'));
console.log('Kunden:', mod.exports.visibleSidebarKeys('Kunden'));
console.log('unknown:', mod.exports.visibleSidebarKeys('Irgendwas'));
console.log('null:', mod.exports.visibleSidebarKeys(null));
"`

Expected:
```
Administrator: [ 'dashboard', 'projects', 'tasks', 'timeTracking', 'calendar', 'settings' ]
Agentur Mitarbeiter: [ 'dashboard', 'projects', 'tasks', 'timeTracking', 'calendar' ]
Kunden: [ 'dashboard', 'projects', 'tasks' ]
unknown: [ 'dashboard' ]
null: [ 'dashboard' ]
```

- [ ] **Step 3: Typecheck**

Run: `npm run --workspace=web typecheck`
Expected: `0 errors`, `0 warnings`, `0 hints`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/auth/roles.ts
git commit -m "$(cat <<'EOF'
feat: add role-based sidebar visibility config

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Astro-Locals-Typing und Auth-Middleware

**Files:**
- Create: `apps/web/src/env.d.ts`
- Create: `apps/web/src/middleware.ts`

**Interfaces:**
- Consumes: `SessionUser` aus `@/lib/auth/types`, `SessionTokens`/`getSessionTokens`/`setSessionCookies`/`clearSessionCookies` aus `@/lib/auth/session`, `createAuthClient` aus `@/lib/auth/directus-auth-client`
- Produces: `Astro.locals.user: SessionUser | null` (verfügbar in jeder `.astro`-Seite und jeder API-Route nach diesem Task); Redirect zu `/login` für jede Route außer `/login` und `/api/auth/*`, sofern kein gültiger Nutzer ermittelt werden kann; Redirect zu `/` wenn `/login` mit gültiger Session aufgerufen wird

- [ ] **Step 1: `env.d.ts` anlegen**

```ts
// apps/web/src/env.d.ts
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import("./lib/auth/types").SessionUser | null
  }
}
```

- [ ] **Step 2: `middleware.ts` anlegen**

```ts
// apps/web/src/middleware.ts
import { defineMiddleware } from "astro:middleware"
import { isDirectusError, readMe } from "@directus/sdk"

import { createAuthClient } from "@/lib/auth/directus-auth-client"
import { clearSessionCookies, getSessionTokens, setSessionCookies } from "@/lib/auth/session"
import type { SessionUser } from "@/lib/auth/types"

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
}

async function loadUser(accessToken: string): Promise<SessionUser | null> {
  const client = createAuthClient()
  await client.setToken(accessToken)

  try {
    const me = (await client.request(
      readMe({ fields: ["id", "email", "first_name", "last_name", "role.name"] }),
    )) as unknown as MeResponse

    const name = [me.first_name, me.last_name].filter(Boolean).join(" ") || me.email

    return { id: me.id, email: me.email, name, role: me.role?.name ?? null }
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
      const refreshClient = createAuthClient()
      try {
        const refreshed = await refreshClient.refresh({
          refresh_token: tokens.refreshToken,
          mode: "json",
        })

        if (refreshed.access_token && refreshed.refresh_token) {
          setSessionCookies(cookies, {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
          })
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
```

- [ ] **Step 3: Typecheck**

Run: `npm run --workspace=web typecheck`
Expected: `0 errors`, `0 warnings`, `0 hints`

- [ ] **Step 4: Middleware-Redirect gegen den Dev-Server prüfen**

Run:
```bash
npm run --workspace=web dev -- --port 4321 &
DEV_PID=$!
sleep 4
echo "--- / ohne Cookie ---"
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" "http://localhost:4321/"
echo "--- /login ohne Cookie ---"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/login"
kill $DEV_PID
```

Expected:
```
--- / ohne Cookie ---
302 -> /login
--- /login ohne Cookie ---
200
```

(`/login` liefert an dieser Stelle noch keine sinnvolle Seite, aber HTTP 200 statt Redirect ist der relevante Check — `index.astro` existiert zu diesem Zeitpunkt noch als Login-Seite, das ist erwartet und wird in Task 5 aufgelöst. Wichtig ist nur: `/` redirected auf `/login`.)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/env.d.ts apps/web/src/middleware.ts
git commit -m "$(cat <<'EOF'
feat: add auth middleware guarding protected routes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Login- und Logout-API-Routen

**Files:**
- Create: `apps/web/src/pages/api/auth/login.ts`
- Create: `apps/web/src/pages/api/auth/logout.ts`

**Interfaces:**
- Consumes: `createAuthClient` aus `@/lib/auth/directus-auth-client`, `setSessionCookies`/`getSessionTokens`/`clearSessionCookies` aus `@/lib/auth/session`
- Produces: `POST /api/auth/login` (Body `{ email: string; password: string }`, Antwort `200 { ok: true }` oder `400/401/500 { error: string }`, setzt bei Erfolg `sb_access`/`sb_refresh`); `POST /api/auth/logout` (Antwort `200 { ok: true }`, löscht Cookies)

- [ ] **Step 1: `login.ts` anlegen**

```ts
// apps/web/src/pages/api/auth/login.ts
import type { APIRoute } from "astro"
import { isDirectusError } from "@directus/sdk"

import { createAuthClient } from "@/lib/auth/directus-auth-client"
import { setSessionCookies } from "@/lib/auth/session"

type LoginBody = {
  email?: string
  password?: string
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: LoginBody
  try {
    body = (await request.json()) as LoginBody
  } catch {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const { email, password } = body
  if (!email || !password) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const client = createAuthClient()

  try {
    const auth = await client.login({ email, password }, { mode: "json" })

    if (!auth.access_token || !auth.refresh_token) {
      throw new Error("Directus login response is missing tokens")
    }

    setSessionCookies(cookies, {
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
    })

    return jsonResponse(200, { ok: true })
  } catch (error) {
    if (isDirectusError(error) && error.errors[0]?.extensions.code === "INVALID_CREDENTIALS") {
      return jsonResponse(401, { error: "invalid_credentials" })
    }

    console.error("Directus login failed", error)
    return jsonResponse(500, { error: "server_error" })
  }
}
```

- [ ] **Step 2: `logout.ts` anlegen**

```ts
// apps/web/src/pages/api/auth/logout.ts
import type { APIRoute } from "astro"

import { createAuthClient } from "@/lib/auth/directus-auth-client"
import { clearSessionCookies, getSessionTokens } from "@/lib/auth/session"

export const POST: APIRoute = async ({ cookies }) => {
  const tokens = getSessionTokens(cookies)

  if (tokens) {
    const client = createAuthClient()
    try {
      await client.logout({ refresh_token: tokens.refreshToken, mode: "json" })
    } catch (error) {
      console.error("Directus logout failed", error)
    }
  }

  clearSessionCookies(cookies)

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run --workspace=web typecheck`
Expected: `0 errors`, `0 warnings`, `0 hints`

- [ ] **Step 4: Login-Route gegen den Dev-Server prüfen (negative Fälle ohne echte Zugangsdaten)**

Run:
```bash
npm run --workspace=web dev -- --port 4321 &
DEV_PID=$!
sleep 4
echo "--- fehlender Body ---"
curl -s -X POST -H "Content-Type: application/json" -d '{}' "http://localhost:4321/api/auth/login"
echo
echo "--- falsche Zugangsdaten ---"
curl -s -X POST -H "Content-Type: application/json" -d '{"email":"nonexistent@example.com","password":"wrong"}' "http://localhost:4321/api/auth/login"
echo
echo "--- logout ohne Session ---"
curl -s -X POST "http://localhost:4321/api/auth/logout"
echo
kill $DEV_PID
```

Expected:
```
--- fehlender Body ---
{"error":"invalid_body"}
--- falsche Zugangsdaten ---
{"error":"invalid_credentials"}
--- logout ohne Session ---
{"ok":true}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/api/auth/login.ts apps/web/src/pages/api/auth/logout.ts
git commit -m "$(cat <<'EOF'
feat: add Directus login and logout API routes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Routing aufteilen — `/login` und geschütztes Dashboard

**Files:**
- Create: `apps/web/src/pages/login.astro`
- Modify: `apps/web/src/pages/index.astro`

**Interfaces:**
- Consumes: `Astro.locals.user: SessionUser | null` (von der Middleware aus Task 3 garantiert nicht `null`, sobald diese Seite erreicht wird, da die Middleware sonst bereits zu `/login` umgeleitet hat)
- Produces: `/login` rendert das (noch unveränderte) `LoginForm`; `/` rendert `SidebarLayout` mit dem eingeloggten Nutzer

- [ ] **Step 1: `login.astro` mit dem aktuellen Login-Markup anlegen**

```astro
---
// apps/web/src/pages/login.astro
import "@workspace/ui/globals.css"
import { LoginForm } from "@/components/login-form"

const locale = Astro.currentLocale ?? "de"
---

<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Astro App</title>
  </head>
  <body>
    <main class="flex min-h-screen items-center justify-center bg-surface p-6">
      <LoginForm client:load locale={locale} />
    </main>
  </body>
</html>
```

- [ ] **Step 2: `index.astro` zum geschützten Dashboard machen**

```astro
---
// apps/web/src/pages/index.astro
import "@workspace/ui/globals.css"
import { SidebarLayout } from "@/components/sidebar-layout"

const locale = Astro.currentLocale ?? "de"
const user = Astro.locals.user!
---

<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Astro App</title>
  </head>
  <body>
    <SidebarLayout client:load locale={locale} user={user}>
      <div class="p-6">
        <h1 class="text-2xl font-bold text-foreground">
          {locale === "de" ? `Willkommen, ${user.name}` : `Welcome, ${user.name}`}
        </h1>
      </div>
    </SidebarLayout>
  </body>
</html>
```

Hinweis: `SidebarLayout` erwartet ab Task 7 eine `user`-Prop. Bis Task 7 abgeschlossen ist, schlägt der Typecheck für diesen Task erwartungsgemäß fehl (`SidebarLayout` kennt `user` noch nicht) — das ist in Ordnung, siehe Step 3.

- [ ] **Step 3: Typecheck (Fehler wegen fehlender `user`-Prop ist an dieser Stelle erwartet)**

Run: `npm run --workspace=web typecheck`
Expected: Fehler in `apps/web/src/pages/index.astro`, dass `SidebarLayout` keine Prop `user` kennt — das wird in Task 7 behoben. Kein anderer Fehler darf auftreten.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/login.astro apps/web/src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: split routing into protected dashboard and login page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Login-Formular interaktiv machen

**Files:**
- Modify: `apps/web/src/components/login-form.tsx`
- Modify: `apps/web/src/i18n/de.ts`
- Modify: `apps/web/src/i18n/en.ts`

**Interfaces:**
- Consumes: `POST /api/auth/login` aus Task 4
- Produces: funktionierendes Login-Formular; neue Dictionary-Keys `loginForm.invalidCredentials` und `loginForm.genericError`

- [ ] **Step 1: i18n-Keys in `de.ts` ergänzen**

In `apps/web/src/i18n/de.ts`, den `loginForm`-Block erweitern:

```ts
  loginForm: {
    title: "Anmeldung",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    submitButton: "Anmelden",
    invalidCredentials: "E-Mail oder Passwort ist falsch.",
    genericError: "Anmeldung derzeit nicht möglich. Bitte versuche es später erneut.",
  },
```

- [ ] **Step 2: i18n-Keys in `en.ts` ergänzen**

In `apps/web/src/i18n/en.ts`, den `loginForm`-Block erweitern:

```ts
  loginForm: {
    title: "Login",
    emailLabel: "Email",
    passwordLabel: "Password",
    submitButton: "Log in",
    invalidCredentials: "Email or password is incorrect.",
    genericError: "Login is currently unavailable. Please try again later.",
  },
```

- [ ] **Step 3: `login-form.tsx` mit echtem Submit-Handling versehen**

```tsx
// apps/web/src/components/login-form.tsx
import { useState, type FormEvent } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Key01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"

import { getDictionary } from "../i18n"

export function LoginForm({ locale }: { locale?: string }) {
  const dict = getDictionary(locale)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        window.location.href = "/"
        return
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null
      setError(
        body?.error === "invalid_credentials"
          ? dict.loginForm.invalidCredentials
          : dict.loginForm.genericError,
      )
      setIsSubmitting(false)
    } catch {
      setError(dict.loginForm.genericError)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
      <div className="flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-orange-100">
          <HugeiconsIcon
            icon={Key01Icon}
            size={40}
            className="text-orange-500"
            strokeWidth={2}
          />
        </div>
      </div>

      <h1 className="mt-6 text-center text-2xl font-bold text-foreground">
       {dict.loginForm.title}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur adipiscing elit sedol do
        eiusmod tempor consectur.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder={dict.loginForm.emailLabel}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={dict.loginForm.passwordLabel}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="bg-orange-500 text-white hover:bg-orange-500/90"
        >
          {dict.loginForm.submitButton}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-foreground">
            <Checkbox
              defaultChecked
              className="data-checked:border-orange-500 data-checked:bg-orange-500"
            />
            Remember account
          </label>
          <a href="#" className="text-foreground hover:underline">
            Forgot your password?
          </a>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-foreground">
        Don&apos;t have an account?{" "}
        <a href="#" className="text-orange-500 underline hover:no-underline">
          Create an account
        </a>
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run --workspace=web typecheck`
Expected: Der bereits aus Task 5 bekannte `SidebarLayout`/`user`-Fehler ist weiterhin der einzige Fehler. Kein neuer Fehler durch `login-form.tsx` oder die i18n-Dateien.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/login-form.tsx apps/web/src/i18n/de.ts apps/web/src/i18n/en.ts
git commit -m "$(cat <<'EOF'
feat: wire login form to Directus login API

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Rollenbasierte Sidebar und funktionierender Logout

**Files:**
- Modify: `apps/web/src/components/nav-main.tsx`
- Modify: `apps/web/src/components/nav-user.tsx`
- Modify: `apps/web/src/components/app-sidebar.tsx`
- Modify: `apps/web/src/components/sidebar-layout.tsx`

**Interfaces:**
- Consumes: `SessionUser` aus `@/lib/auth/types`, `SidebarKey`/`visibleSidebarKeys` aus `@/lib/auth/roles`, `POST /api/auth/logout` aus Task 4
- Produces: `SidebarLayout({ children, locale, user }: { children?: ReactNode; locale?: string; user: SessionUser })` — schließt die in Task 5 offene Prop-Lücke; Logout-Eintrag in `NavUser` ruft `/api/auth/logout` auf und leitet danach auf `/login` weiter

- [ ] **Step 1: `NavItem`-Typ in `nav-main.tsx` um `id: SidebarKey` erweitern**

In `apps/web/src/components/nav-main.tsx`, den bestehenden Import-Block um den Typ-Import ergänzen und `NavItem` erweitern:

```tsx
import type { SidebarKey } from "../lib/auth/roles"

export type NavItem = {
  id: SidebarKey
  title: string
  url: string
  icon?: IconSvgElement
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}
```

(Der restliche Inhalt von `nav-main.tsx` bleibt unverändert — `id` wird hier nur mitgeführt, nicht gerendert.)

- [ ] **Step 2: `nav-user.tsx` — Logout-Eintrag mit echtem Handler versehen**

In `apps/web/src/components/nav-user.tsx` eine `handleLogout`-Funktion
ergänzen und im bestehenden `DropdownMenuItem` als `onClick` verdrahten
(Rest der Datei unverändert):

```tsx
export function NavUser({
  user,
  dict,
}: {
  user: {
    name: string
    email: string
    avatar?: string
  }
  dict: Dictionary
}) {
  const { isMobile } = useSidebar()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={handleLogout}>
              <HugeiconsIcon icon={Logout01Icon} />
              {dict.user.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

- [ ] **Step 3: `app-sidebar.tsx` auf echten Nutzer + Rollenfilter umstellen**

```tsx
// apps/web/src/components/app-sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Calendar01FreeIcons,
  ClipboardList,
  Clock02FreeIcons,
  DashboardSquare01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"

import { NavMain, type NavItem } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { getDictionary } from "../i18n"
import { visibleSidebarKeys } from "../lib/auth/roles"
import type { SessionUser } from "../lib/auth/types"
import FolderClosedIcon from "@hugeicons/core-free-icons/FolderClosedIcon"

export function AppSidebar({ locale, user }: { locale?: string; user: SessionUser }) {
  const dict = getDictionary(locale)
  const visibleKeys = visibleSidebarKeys(user.role)

  const navMain = [
    {
      id: "dashboard",
      title: dict.sidebar.dashboard,
      url: "#",
      icon: DashboardSquare01Icon as IconSvgElement,
      isActive: true,
    },
    {
      id: "projects",
      title: dict.sidebar.projects,
      url: "#",
      icon: FolderClosedIcon as IconSvgElement,
    },
    {
      id: "tasks",
      title: dict.sidebar.tasks,
      url: "#",
      icon: ClipboardList as IconSvgElement,
    },
    {
      id: "timeTracking",
      title: dict.sidebar.timeTracking,
      url: "#",
      icon: Clock02FreeIcons as IconSvgElement,
    },
    {
      id: "calendar",
      title: dict.sidebar.calendar,
      url: "#",
      icon: Calendar01FreeIcons as IconSvgElement,
    },
    {
      id: "settings",
      title: dict.sidebar.settings,
      url: "#",
      icon: Settings01Icon as IconSvgElement,
    },
  ] satisfies NavItem[]

  const filteredNavMain = navMain.filter((item) => visibleKeys.includes(item.id))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher name="Orange Promotion" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} dict={dict} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email }} dict={dict} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
```

- [ ] **Step 4: `sidebar-layout.tsx` um `user`-Prop erweitern**

```tsx
// apps/web/src/components/sidebar-layout.tsx
import type { ReactNode } from "react"

import { AppSidebar } from "./app-sidebar"
import type { SessionUser } from "../lib/auth/types"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

export function SidebarLayout({
  children,
  locale,
  user,
}: {
  children?: ReactNode
  locale?: string
  user: SessionUser
}) {
  return (
    <SidebarProvider>
      <AppSidebar locale={locale} user={user} />
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run --workspace=web typecheck`
Expected: `0 errors`, `0 warnings`, `0 hints` (der `SidebarLayout`/`user`-Fehler aus Task 5 ist jetzt behoben)

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/nav-main.tsx apps/web/src/components/nav-user.tsx apps/web/src/components/app-sidebar.tsx apps/web/src/components/sidebar-layout.tsx
git commit -m "$(cat <<'EOF'
feat: filter sidebar items by Directus role and wire up logout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Manuelle End-to-End-Verifikation

Kein Code-Task — dieser Task bestätigt den kompletten Flow gegen die echte
Directus-Instanz mit den drei realen Accounts. Kann nur vom Nutzer
ausgeführt werden (Zugangsdaten liegen nicht vor).

**Files:** keine

- [ ] **Step 1: Build prüfen**

Run: `npm run --workspace=web build`
Expected: Build läuft ohne Fehler durch.

- [ ] **Step 2: Dev-Server starten**

Run: `npm run --workspace=web dev`

- [ ] **Step 3: Checkliste im Browser (`http://localhost:4321`)**

- [ ] Aufruf von `/` ohne Session → Redirect zu `/login`
- [ ] Login mit dem Administrator-Account → Redirect zu `/`, Sidebar zeigt alle 6 Punkte inkl. Einstellungen
- [ ] Logout → Redirect zu `/login`, danach ist `/` wieder geschützt
- [ ] Login mit dem Agentur-Mitarbeiter-Account → Sidebar zeigt Dashboard, Projekte, Aufgaben, Zeiterfassung, Kalender (kein Einstellungen)
- [ ] Login mit dem Kunden-Account → Sidebar zeigt nur Dashboard, Projekte, Aufgaben
- [ ] Falsches Passwort bei einem der drei Accounts → Fehlermeldung im Formular, kein Redirect
- [ ] Direkter Aufruf von `/login` mit bestehender Session (z. B. nach Login in derselben Session per Tab) → Redirect zu `/`

- [ ] **Step 4: Ergebnis festhalten**

Kurz im PR/Commit-Kommentar oder gegenüber dem Team vermerken, welche der
drei Accounts erfolgreich getestet wurden.
