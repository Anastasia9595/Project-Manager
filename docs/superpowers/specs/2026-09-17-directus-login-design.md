# Directus Login mit rollenbasierter Sidebar

Datum: 2026-09-17
Status: Approved

## Kontext

`apps/web` ist eine Astro-App (SSR, `output: server`, `@astrojs/node` im
`standalone`-Modus) mit Directus als Backend. Ein Directus-Client mit
statischem Token existiert bereits (`src/lib/directus.ts`) für
Server-zu-Server-Zugriffe. Die UI (Login-Formular, Sidebar, Nav-User) ist
bereits als statisches Mockup vorhanden, aber ohne echte Funktionalität.

Es gibt drei Directus-Rollen in der Ziel-Instanz:

- `Administrator`
- `Agentur Mitarbeiter`
- `Kunden`

Ziel: Ein echtes Login gegen Directus, bei dem sich Nutzer mit allen drei
Rollen einloggen können. Login-Verfahren ist für alle Rollen identisch
(ein `/auth/login`-Aufruf); die Rolle steuert danach nur, was in der UI
sichtbar ist.

## Architektur

Die App läuft SSR auf Node — Login und Session-Handling laufen komplett
serverseitig, Tokens verlassen den Server nie Richtung Browser-JS.

### Directus-Clients

- **Admin-Client** (bestehend, `src/lib/directus.ts`): Static-Token-Client,
  bleibt unverändert für Server-zu-Server-Aufgaben ohne Nutzerkontext.
- **Auth-Client** (neu): pro Login-/Refresh-Request ein frischer Directus-
  Client mit `authentication('json')` + `rest()`. Kein Singleton, da
  Login/Refresh pro Request mit unterschiedlichen Credentials/Tokens
  passiert.

### Session

Zwei httpOnly-Cookies:

- `sb_access` — Directus Access-Token
- `sb_refresh` — Directus Refresh-Token

Cookie-Attribute: `httpOnly: true`, `secure: true` (außer in lokaler
Dev-Umgebung), `sameSite: "lax"`, `path: "/"`. `maxAge` orientiert sich an
der Directus-Refresh-Token-Lebensdauer (Default 7 Tage), Access-Token wird
serverseitig per Ablaufzeitstempel geprüft, nicht über die Cookie-Laufzeit.

### Middleware (`src/middleware.ts`)

Läuft vor jedem Seiten-Request:

1. Liest `sb_access`/`sb_refresh` aus den Cookies.
2. Ist kein Access-Token vorhanden oder abgelaufen, aber ein Refresh-Token
   vorhanden: Refresh über den Auth-Client, neue Cookies setzen.
3. Ist kein gültiges Token-Paar zu erreichen: Cookies löschen.
4. Mit gültigem Access-Token: `GET /users/me?fields=id,email,first_name,last_name,role.name`
   abrufen, Ergebnis nach `Astro.locals.user` schreiben (`{ id, email,
   name, role }`, `role` = Directus-Rollenname als String).
5. Routing-Entscheidung:
   - Keine gültige Session und Ziel ≠ `/login` (und kein `/api/auth/*`) →
     Redirect zu `/login`.
   - Gültige Session und Ziel = `/login` → Redirect zu `/`.

### Rollen- und Sidebar-Konfiguration (neu, z. B. `src/lib/auth/roles.ts`)

```ts
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

export const SIDEBAR_VISIBILITY: Record<RoleName, SidebarKey[]> = {
  [ROLES.ADMIN]: ALL_KEYS,
  [ROLES.MITARBEITER]: ["dashboard", "projects", "tasks", "timeTracking", "calendar"],
  [ROLES.KUNDE]: ["dashboard", "projects", "tasks"],
}

// Fail-closed: unbekannte/fehlende Rolle sieht nur das Dashboard.
export function visibleSidebarKeys(role: string | undefined): SidebarKey[] {
  if (role && role in SIDEBAR_VISIBILITY) {
    return SIDEBAR_VISIBILITY[role as RoleName]
  }
  return ["dashboard"]
}
```

## Routing-Änderungen

- `src/pages/index.astro` wird das geschützte Dashboard: `SidebarLayout` +
  `AppSidebar`, liest `Astro.locals.user` (von der Middleware gesetzt) und
  reicht `role` durch.
- `src/pages/login.astro` (neu): aktuelles Login-Markup aus `index.astro`
  wandert hierhin.
- `src/pages/api/auth/login.ts` (neu, POST): Body `{ email, password }` →
  Auth-Client-Login → bei Erfolg Cookies setzen, `{ ok: true }` zurückgeben.
  Bei Fehlschlag `401` mit `{ error: "invalid_credentials" }`.
- `src/pages/api/auth/logout.ts` (neu, POST): Refresh-Token bei Directus
  invalidieren (best effort, Fehler wird geloggt aber blockiert Logout
  nicht), Cookies löschen, `{ ok: true }` zurückgeben.

## Komponenten-Änderungen

- `login-form.tsx`: `onSubmit`-Handler, der `fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })`
  aufruft. Lade-Zustand am Submit-Button, Fehlermeldung bei `401`/`500`
  unterhalb des Formulars (i18n-Key ergänzen: `loginForm.invalidCredentials`,
  `loginForm.genericError`). Bei Erfolg `window.location.href = "/"`.
- `app-sidebar.tsx`: neue Prop `role?: string`, filtert `navMain` über
  `visibleSidebarKeys(role)` statt alle Punkte hart zu rendern. Jeder
  `NavItem` bekommt einen `key: SidebarKey`, damit gefiltert werden kann.
- `nav-user.tsx`: `user`-Prop kommt jetzt aus `Astro.locals.user` statt
  Hardcoding; Logout-Eintrag ruft `POST /api/auth/logout` auf und leitet
  danach auf `/login` weiter.

## Fehlerbehandlung

| Fall | Verhalten |
|---|---|
| Falsche Zugangsdaten | `401`, Formular zeigt Inline-Fehlermeldung, keine Cookies gesetzt |
| Directus nicht erreichbar (Login) | `500`, generische Fehlermeldung im Formular, Fehler serverseitig geloggt |
| Refresh-Token abgelaufen/ungültig | Middleware löscht Cookies, Redirect zu `/login`, kein Redirect-Loop |
| Rolle nicht in `SIDEBAR_VISIBILITY` | Fail-closed: nur Dashboard sichtbar, kein Fehler |
| `/users/me`-Abruf schlägt trotz gültigem Access-Token fehl | Wie abgelaufene Session behandeln (Cookies löschen, Redirect) |

## Testing

Kein Test-Framework im Repo vorhanden (nur `astro check` / `eslint`).
Verifikation nach Umsetzung manuell durch den Nutzer mit den drei echten
Directus-Accounts:

1. Login mit Administrator-, Mitarbeiter- und Kunden-Account, jeweils
   korrekte Sidebar-Punkte prüfen.
2. Falsches Passwort → Fehlermeldung, kein Login.
3. Direkter Aufruf von `/` ohne Session → Redirect zu `/login`.
4. Aufruf von `/login` mit bestehender Session → Redirect zu `/`.
5. Logout → Redirect zu `/login`, danach ist `/` wieder geschützt.

## Out of Scope

- Passwort-Reset / "Konto erstellen" (im Mockup vorhanden, bleibt
  vorerst nicht funktional)
- Feingranulare Datenrechte auf Collection-Ebene (wird von Directus
  selbst über die Rolle des eingeloggten Nutzers durchgesetzt, kein
  App-seitiger Code nötig)
- "Remember account"-Checkbox im Formular (bleibt UI-only)
