# Formular „Neues Projekt" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Button „Neues Projekt" auf `/projects` öffnet einen Dialog, der eine `printing_lines`-Zeile samt `form_submissions`-Zeile in Directus anlegt.

**Architecture:** Server-Logik in `src/services/projects/` (Values, Validierung, Mapper rein + getestet; Repository mit Directus-SDK und User-Token; Handler mit injizierten Repository-Funktionen), zwei API-Routen mit `withSession`, im Browser ein dünner Client, Hooks und ein Dialog im Design von `customer-contact-form.tsx`. Spec: `docs/superpowers/specs/2026-11-05-new-project-form-design.md`.

**Tech Stack:** Astro 7, React 19, `@directus/sdk` 25, Vitest 3, sonner, Tailwind/shadcn (`@workspace/ui`).

## Global Constraints

- Arbeitsverzeichnis `apps/web`; Pfad-Alias `@/` = `src/`. Tests: `npm test` (Vitest), Typecheck `npx astro check` (0 errors), `npx eslint src`; Prettier nur auf geänderte Dateien.
- Kommentare/UI-Texte deutsch, Bezeichner englisch; Stil der Nachbardateien übernehmen (kein Semikolon, doppelte Anführungszeichen, 2 Leerzeichen).
- Alle Directus-Zugriffe mit dem Token der angemeldeten Person (`createUserClient(accessToken)` aus `@/services/directus/client`); nie einen statischen Token verwenden, nie ein Token ausgeben oder committen.
- `printing_lines.status` immer `"created"` senden (Directus-Default `draft` ist ungültig).
- `assigned_contact` (printing_lines und form_submissions) = `session.user.id`; die Agentur-Rolle darf `directus_users` nicht auflisten.
- `form_submissions.pal_date` muss `>= $NOW` sein → dort `max(PAL-Datum, morgen)` senden; `printing_lines.pal_date` bleibt das echte Datum.
- Primärschlüssel: `tenants`, `media_types`, `media_variants` = UUID; `printing_companies`, `tenant_users` = Integer (als String im Formular, als Zahl an Directus).
- Das Formular und die Options-Route sind nur für `canViewInternalWork(role)` (`@/lib/auth/roles`); sonst `403`.
- Logs: nur Status/Codes (siehe `toErrorResponse` in `@/lib/customer-contact-form/error-response`), nie Formularinhalte.
- Nicht anfassen: `scripts/` (untracked), `.superpowers/`.

## File Structure

| Datei | Verantwortung |
|---|---|
| `src/services/projects/new-project.values.ts` | `NewProjectValues`, leere Werte, Typ-Guard `isNewProjectValues` |
| `src/services/projects/new-project.validation.ts` | `validateNewProject(values, today)` + `MAX_LENGTH` (Browser und Server) |
| `src/services/projects/new-project.mapper.ts` | Payloads für Directus, Nummernvergabe, Morgen-Clamp (rein) |
| `src/services/projects/new-project.types.ts` | `ProjectOptions` und Directus-Zeilentypen der Optionen |
| `src/services/projects/new-project.repository.ts` | `fetchProjectOptions`, `createProject` mit Aufräumen |
| `src/services/projects/new-project.handlers.ts` | `handleCreateProject`, `handleProjectOptions` |
| `src/pages/api/projects/index.ts`, `options.ts` | Routen |
| `src/services/projects/projects.client.ts` | Browser-Client |
| `src/hooks/use-project-options.ts`, `use-new-project-form.ts` | Zustand |
| `src/components/projects/new-project/*` | Dialog und Feldgruppen |
| `src/i18n/de.ts`, `en.ts`, `src/components/projects/projects-page.tsx`, `src/pages/projects.astro` | Texte und Anbindung |

---

### Task 1: Formularwerte und Validierung

**Files:**
- Create: `src/services/projects/new-project.values.ts`, `src/services/projects/new-project.validation.ts`
- Test: `src/services/projects/new-project.validation.test.ts`

**Interfaces:**
- Produces:
```ts
export const DELIVERY_TYPES = ["pal", "delivery"] as const
export type DeliveryType = (typeof DELIVERY_TYPES)[number]
export type NewProjectValues = {
  name: string
  tenantId: string          // UUID
  tenantUserId: string      // "" oder Integer-String
  mediaTypeId: string       // UUID
  variantId: string         // UUID
  printingCompanyId: string // Integer-String
  circulation: string       // Integer-String
  palDate: string           // YYYY-MM-DD
  bufferDays: string        // "" oder Integer-String
  deliveryType: "" | DeliveryType
  deliveryDate: string      // "" oder YYYY-MM-DD
  distributionDate: string  // "" oder YYYY-MM-DD
  validUntil: string        // "" oder YYYY-MM-DD
  description: string
  internalNotes: string
}
export const EMPTY_NEW_PROJECT_VALUES: NewProjectValues  // alle Strings ""
export function isNewProjectValues(body: unknown): body is NewProjectValues
// validation
export const MAX_LENGTH = { name: 200, description: 2000, internalNotes: 2000 } as const
export const MAX_CIRCULATION = 10_000_000
export const MAX_BUFFER_DAYS = 365
export type ProjectValidationCode = "required" | "invalid" | "tooLong" | "pastDate"
export type ProjectValidationErrors = Partial<Record<keyof NewProjectValues, ProjectValidationCode>>
export function validateNewProject(values: NewProjectValues, today: string): ProjectValidationErrors
```
- Wiederverwenden: `isUuid` aus `@/utils/is-uuid`, `isCalendarDay` aus `@/services/time-entries/time-entries.mapper` (YYYY-MM-DD, echtes Kalenderdatum), Muster aus `src/lib/customer-contact-form/fields.ts` und `validation.ts`.

Regeln von `validateNewProject` (Schlüssel = Feldname, Wert = Code, nur Fehler enthalten):
- `name`: leer/Leerzeichen → `required`; `length > 200` (Rohwert) → `tooLong`.
- `tenantId`, `mediaTypeId`, `variantId`: leer → `required`; sonst kein UUID → `invalid`.
- `printingCompanyId`: leer → `required`; nicht `/^\d+$/` → `invalid`.
- `tenantUserId`: leer erlaubt; sonst nicht `/^\d+$/` → `invalid`.
- `circulation`: leer → `required`; nicht `/^\d+$/` oder `0` oder `> 10_000_000` → `invalid`.
- `palDate`: leer → `required`; `!isCalendarDay` → `invalid`; `< today` (String-Vergleich) → `pastDate`.
- `bufferDays`: leer erlaubt; sonst nicht `/^\d+$/` oder `> 365` → `invalid`.
- `deliveryDate`, `distributionDate`, `validUntil`: leer erlaubt; sonst `!isCalendarDay` → `invalid`.
- `deliveryType`: `""` oder `pal`/`delivery`, sonst `invalid` (Typ-Guard fängt das schon ab; die Validierung prüft es zusätzlich).
- `description`, `internalNotes`: `length > 2000` → `tooLong`.

`isNewProjectValues`: Objekt, alle 15 Schlüssel sind Strings, `deliveryType` ist `""` oder ein `DeliveryType`.

- [ ] **Step 1: Test schreiben** (`new-project.validation.test.ts`): ein Helfer `valid()` mit gültigen Werten (name "Test", UUIDs `"00000000-0000-4000-8000-000000000001"` usw., printingCompanyId "3", circulation "10000", palDate "2026-12-01"), `today = "2026-11-05"`. Fälle: gültige Werte → `{}`; jedes Pflichtfeld leer → `required`; palDate "2026-11-04" → `pastDate`, "2026-11-05" → ok, "2026-02-30" → `invalid`; circulation "0", "abc", "10000001" → `invalid`; bufferDays "366" → `invalid`, "" → ok; name 201 Zeichen → `tooLong`; description 2001 → `tooLong`; tenantId "abc" → `invalid`; `isNewProjectValues`: gültig → true, Feld fehlt → false, `deliveryType: "x"` → false, `null` → false.
- [ ] **Step 2:** `npx vitest run src/services/projects/new-project.validation.test.ts` → FAIL (Module fehlen).
- [ ] **Step 3:** Beide Dateien implementieren.
- [ ] **Step 4:** Test erneut → PASS.
- [ ] **Step 5:** Commit `feat(web): add new project form values and validation`.

---

### Task 2: Mapper, Typen und Repository

**Files:**
- Create: `src/services/projects/new-project.types.ts`, `new-project.mapper.ts`, `new-project.repository.ts`
- Test: `src/services/projects/new-project.mapper.test.ts`

**Interfaces:**
- Consumes: `NewProjectValues` (Task 1), `createUserClient`.
- Produces:
```ts
// types
export type ProjectOptions = {
  tenants: { id: string; name: string }[]
  tenantUsers: { id: string; name: string; tenant: string | null }[]
  mediaTypes: { id: string; name: string }[]
  variants: { id: string; name: string; mediaType: string | null }[]
  printingCompanies: { id: string; name: string }[]
}
// mapper (rein)
export function nextProjectNumber(existing: (string | null)[], year: number): string  // "P-2026-031"
export function submissionPalDate(palDate: string, today: string): string             // max(palDate, today+1)
export function toSubmissionPayload(input: SubmissionInput): Record<string, unknown>
export function toPrintingLinePayload(input: LineInput): Record<string, unknown>
export function toProjectOptions(rows: ProjectOptionRows): ProjectOptions
// repository
export async function fetchProjectOptions(accessToken: string): Promise<ProjectOptions>
export type ProjectLookup = { tenantName: string; mediaTypeCategory: string | null; variantMediaType: string | null; contactTenant: string | null }
export async function fetchProjectLookup(accessToken: string, values: NewProjectValues): Promise<ProjectLookup>
export async function createProject(accessToken: string, values: NewProjectValues, userId: string, lookup: ProjectLookup, today: string): Promise<{ id: string; name: string }>
```
`SubmissionInput = { values: NewProjectValues; userId: string; lookup: ProjectLookup; today: string }`, `LineInput = SubmissionInput & { submissionId: string; projectNumber: string }`.

Payload-Regeln (exakte Directus-Feldnamen):
- Submission: `status: "approved"`, `customer_company: lookup.tenantName`, `submitted_by: Number(tenantUserId) | null`, `selected_medium: mediaTypeId`, `selected_variant: variantId`, `medium_category: lookup.mediaTypeCategory`, `circulation: Number`, `assigned_printer: Number(printingCompanyId)`, `assigned_contact: userId`, `layout_choice: "orange_individual"`, `pal_date: submissionPalDate(...)`.
- Line: `name: name.trim()`, `status: "created"`, `project_number`, `project_description: description.trim() || null`, `internal_notes: internalNotes.trim() || null`, `tenant`, `tenant_user: Number | null`, `printing_company: Number`, `media_type`, `variant`, `category: lookup.mediaTypeCategory`, `assigned_contact: userId`, `delivery_type: deliveryType || null`, `circulation: Number`, `buffer_days: Number | null`, `pal_date`, `delivery_date | null`, `distribution_date | null`, `valid_until | null`, `form_submission: submissionId`.
- `nextProjectNumber`: höchste Zahl hinter `P-<year>-` unter `existing` (nicht passende/`null` ignorieren) + 1, dreistellig mit Nullen (`P-2026-001` wenn keine).
- `submissionPalDate`: `today` + 1 Tag als `YYYY-MM-DD` (UTC-Rechnung auf den Stringwerten, keine Zeitzonen-Annahme), Ergebnis `max` per String-Vergleich.
- `toProjectOptions`: Namen: Kunde `tenant_name ?? ""`, Kontaktperson `first_name last_name` (getrimmt), Druckerei `company_name` + optional ` company_suffix`; `id` bei Integer-Schlüsseln `String(id)`.

Repository (Muster `src/lib/customer-contact-form/repository.ts` und `services/projects/projects.repository.ts`):
- `fetchProjectOptions`: `Promise.all` über `readItems` von `tenants` (`id`, `tenant_name`), `tenant_users` (`id`, `first_name`, `last_name`, `tenant`), `media_types` (`id`, `name`), `media_variants` (`id`, `name`, `product`), `printing_companies` (`id`, `company_name`, `company_suffix`); je `limit: -1` und sinnvolle Sortierung; Ergebnis über `toProjectOptions`.
- `fetchProjectLookup`: `readItem("tenants", tenantId, {fields:["tenant_name"]})`, `readItem("media_types", mediaTypeId, {fields:["category"]})`, `readItem("media_variants", variantId, {fields:["product"]})`, bei gesetzter Kontaktperson `readItem("tenant_users", Number(id), {fields:["tenant"]})` — parallel. Directus-403/404 werden nicht abgefangen (Handler übersetzt).
- `createProject`: (1) `readItems("printing_lines", {fields:["project_number"], filter:{project_number:{_starts_with:`P-${year}-`}}, limit:-1})` mit `year` = Jahr von `values.palDate`; (2) `createItem("form_submissions", toSubmissionPayload(...))` (`fields:["id"]`); (3) `createItem("printing_lines", toPrintingLinePayload(...))` (`fields:["id","name"]`) in try/catch: bei Fehler `deleteItem("form_submissions", submissionId)` in eigenem try/catch (Fehler nur mit `console.error("project cleanup failed")` ohne Inhalte loggen), dann den ursprünglichen Fehler weiterwerfen. `// shortcut: Projektnummer ohne Sperre, bei Parallelanlage evtl. doppelt; bei Bedarf Unique-Constraint in Directus`.

- [ ] **Step 1: Mapper-Test schreiben**: `nextProjectNumber` (leer → `P-2026-001`; `["P-2026-009","P-2026-031","P-2025-099", null, "x"]` → `P-2026-032`), `submissionPalDate` (`"2026-12-01","2026-11-05"` → `"2026-12-01"`; `"2026-11-05","2026-11-05"` → `"2026-11-06"`; `"2026-11-30","2026-11-30"` → `"2026-12-01"`), Payloads (Zahlen statt Strings, Leerstrings → `null`, `status`, `form_submission`, `assigned_contact`), `toProjectOptions` (Namen, Integer-Ids als String).
- [ ] **Step 2:** `npx vitest run src/services/projects/new-project.mapper.test.ts` → FAIL.
- [ ] **Step 3:** Types, Mapper, Repository implementieren.
- [ ] **Step 4:** Test → PASS; `npx astro check` → 0 errors.
- [ ] **Step 5:** Commit `feat(web): add new project mapper and Directus repository`.

---

### Task 3: Handler und API-Routen

**Files:**
- Create: `src/services/projects/new-project.handlers.ts`, `src/pages/api/projects/index.ts`, `src/pages/api/projects/options.ts`
- Test: `src/services/projects/new-project.handlers.test.ts`

**Interfaces:**
- Consumes: Task 1 und 2; `jsonResponse`, `readJsonBody`, `toErrorResponse`/`getDirectusStatus` aus `@/lib/customer-contact-form/error-response`, `canViewInternalWork`.
- Produces:
```ts
export type CreateProjectDeps = {
  fetchLookup: typeof fetchProjectLookup
  create: typeof createProject
  today: () => string   // lokales YYYY-MM-DD
}
export async function handleCreateProject(request: Request, session: { tokens: { accessToken: string }; user: { id: string; role: string | null } }, deps?: Partial<CreateProjectDeps>): Promise<Response>
export async function handleProjectOptions(session, fetchOptions?: typeof fetchProjectOptions): Promise<Response>
```
Reihenfolge in `handleCreateProject`: (1) `!canViewInternalWork(role)` → `403 {error:"forbidden"}`; (2) Body per `readJsonBody` + `isNewProjectValues`, sonst `400 {error:"invalid_body"}`; (3) `validateNewProject(body, deps.today())` nicht leer → `400 {error:"invalid_fields", fields}`; (4) `fetchLookup`, Directus-403/404 (`getDirectusStatus`) → `400 {error:"invalid_reference"}`, sonst `toErrorResponse(error,"Directus project lookup","create_failed")`; (5) `lookup.variantMediaType !== body.mediaTypeId` → `400 {error:"invalid_variant"}`; bei gesetzter `tenantUserId` und `lookup.contactTenant !== body.tenantId` → `400 {error:"invalid_contact"}`; (6) `create(...)` → `201 {id, name}`, Fehler → `toErrorResponse(error,"Directus project create","create_failed")`. Standard-`today`: lokales Datum (`toDayKey(new Date())` aus dem vorhandenen Util, `rg "export function toDayKey" src`). `handleProjectOptions`: ohne Berechtigung `403`, sonst `200` mit den Optionen, Fehler über `toErrorResponse(error,"Directus project options","options_failed")`.

Routen (Muster `src/pages/api/customer-contacts/index.ts` und `options.ts`): `export const POST = withSession((ctx, session) => handleCreateProject(ctx.request, session))`, `export const GET = withSession((_c, session) => handleProjectOptions(session))`; `export const prerender = false` falls die Nachbardateien es setzen.

- [ ] **Step 1: Handler-Test** (Vitest, Repository-Funktionen als `vi.fn()` injiziert, Requests als `new Request("http://x", {method:"POST", body: JSON.stringify(values)})`): Kunde-Rolle → 403 und `create` nicht aufgerufen; kaputter Body → 400 `invalid_body`; leerer Name → 400 `invalid_fields` mit `fields.name === "required"`; Variante gehört zu anderem Medientyp → 400 `invalid_variant`; Kontaktperson anderer Kunde → 400 `invalid_contact`; Erfolg → 201 `{id,name}` und `create` mit `userId` aus der Session; `create` wirft → Fehlerantwort (502) ohne Inhalte im Body; Options: Kunde → 403, Agentur → 200.
- [ ] **Step 2:** Test ausführen → FAIL.
- [ ] **Step 3:** Handler und Routen implementieren.
- [ ] **Step 4:** Test → PASS; `npx astro check`, `npx eslint src` sauber.
- [ ] **Step 5:** Commit `feat(web): add create project API route and options route`.

---

### Task 4: Browser-Client, Hooks, Dialog und Anbindung

**Files:**
- Create: `src/services/projects/projects.client.ts`, `src/hooks/use-project-options.ts`, `src/hooks/use-new-project-form.ts`, `src/components/projects/new-project/new-project-form.tsx`, Feldgruppen unter `src/components/projects/new-project/` (z. B. `project-basics-fields.tsx`, `project-schedule-fields.tsx`, `project-notes-fields.tsx`)
- Modify: `src/i18n/de.ts`, `src/i18n/en.ts` (`projectsPage.form`), `src/components/projects/projects-page.tsx`, `src/pages/projects.astro`
- Test: `src/services/projects/projects.client.test.ts` (Fehlerabbildung)

**Interfaces:**
- Consumes: Task 1–3, Muster aus `src/components/customer-contacts/customer-contact-form.tsx`, `contact-text-field.tsx`, `form-select.tsx`, `contact-form-footer.tsx`, `src/hooks/use-contact-options.ts`, `src/hooks/use-customer-contact-form.ts`, `src/lib/customer-contact-form/submit.ts` und `messages.ts`, `src/components/settings/form-field.tsx`, `settings-input.tsx`.
- Produces:
```ts
export type SubmitProjectResult =
  | { ok: true; id: string; name: string }
  | { ok: false; error: string; fields?: ProjectValidationErrors }
export async function submitNewProject(values: NewProjectValues): Promise<SubmitProjectResult>   // POST /api/projects, 20 s Timeout, Netzwerkfehler → "network_error"
export function useProjectOptions(): { state: ... ; retry: () => void }                           // GET /api/projects/options, wie useContactOptions
export function useNewProjectForm(args: { formRef; onCreated: (name: string) => void; onSavingChange: (s: boolean) => void }): { values; errors; saving; submitError; setField; setTenant; setMediaType; submit }
```
Verhalten (identisch zum Kundenkontakt-Formular, nur andere Felder):
- Dialog `NewProjectForm({ open, onClose, onCreated, t })` mit `max-w-2xl`, Titel/Beschreibung, Laden/Fehler/„Erneut versuchen"/403-Zustand, Fußzeile mit Fehlermeldung, Abbrechen, Speichern; Schließen während des Speicherns gesperrt; Body wird nur bei offenem Dialog gerendert (startet leer).
- Felder in Gruppen: (1) Projekt: Name, Kunde (`FormSelect`), Kontaktperson (gefiltert nach Kunde, optional, Platzhalter wenn kein Kunde gewählt), Medientyp, Variante (gefiltert nach Medientyp, Platzhalter solange kein Medientyp), Druckerei, Auflage (`inputMode="numeric"`); (2) Termine: PAL-Datum (`type="date"`, `min` = heute), Pufferzeit, Lieferart (optional, `emptyLabel`), Lieferdatum, Verteildatum, gültig bis (alle `type="date"`); (3) Texte: Beschreibung, interne Notizen (`textarea` aus `@workspace/ui/components/textarea`).
- Kunde wechseln leert Kontaktperson; Medientyp wechseln leert Variante.
- Clientseitig `validateNewProject(values, todayLocal)`; Fehler zeigen `t.validation[...]`, erstes fehlerhaftes Feld bekommt Fokus (`aria-invalid`), Serverfehler `invalid_fields` werden auf die Felder gelegt, andere Codes → `t.errors` (`unauthorized`→Sitzung abgelaufen, `forbidden`, `invalid_variant`, `invalid_contact`, sonst Speichern fehlgeschlagen).
- i18n: `projectsPage.form` in `de.ts` und `en.ts` mit allen Texten (Titel „Neues Projekt", Beschreibung, Pflichthinweis, Feldlabels, Platzhalter, Validierung je Code, Fehler, `created: "Projekt „{name}“ wurde angelegt."`, Laden, Erneut versuchen, Abbrechen, Anlegen/Speichert…). Typ der Texte aus dem Dictionary ableiten wie `ContactFormTexts`.
- `ProjectsPage` erhält `canCreate: boolean`; `CreateButton` mit `onClick` nur bei `canCreate`; `onCreated` → `setFormOpen(false)`, `toast.success(fillTemplate(dict.form.created, { name }))`, danach `window.location.reload()` nach kurzer Verzögerung (z. B. 800 ms), damit der Toast sichtbar bleibt; `<Toaster position="bottom-right" />` wie bei den Kundenkontakten. `projects.astro` übergibt `canCreate={canViewInternalWork(Astro.locals.user!.role)}`.

- [ ] **Step 1: Client-Test** schreiben (`fetch` mocken): 201 → `{ok:true,id,name}`; 400 `invalid_fields` → Felder durchgereicht; 403 → `error:"forbidden"`; `fetch` wirft → `network_error`; Antwort ohne JSON → `server_error`.
- [ ] **Step 2:** Test → FAIL; Client implementieren → PASS.
- [ ] **Step 3:** Hooks, Dialog, Feldgruppen, i18n und Anbindung implementieren; jede Datei klein halten (Feldgruppen getrennt, wie bei `contact-*-fields.tsx`).
- [ ] **Step 4:** `npm test` (alle grün), `npx astro check` (0 errors), `npx eslint src`, Prettier auf geänderte Dateien.
- [ ] **Step 5:** Commit `feat(web): add new project dialog to the projects page`.

---

### Task 5 (Controller, nicht an Subagent): Live-Prüfung

Mit dem Agentur-Login (Passwort nur im Chat, nie in Dateien): Dev-Server starten, Options-Route prüfen (Kunde-Rolle 403), Projekt anlegen, in Directus lesen (`printing_lines` + `form_submissions` verknüpft, `status created`, `project_number`, `category`, `assigned_contact`), Fehlerfälle (Vergangenheit, falsche Variante), Rollback-Fall. Testdaten erst nach Freigabe löschen.
