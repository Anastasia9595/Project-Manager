# Formular „Neue Aufgabe" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Button „Neue Aufgabe" auf `/tasks` öffnet einen Dialog, der eine Aufgabe (frei oder aus einer Vorlage) immer mit Projektzuordnung in Directus anlegt.

**Architecture:** Wie beim Projekt-Formular: Server-Logik in `src/services/tasks/` (Values, Validierung, Mapper rein + getestet; Repository mit Directus-SDK und User-Token; Handler mit injizierten Repository-Funktionen), zwei API-Routen mit `withSession`, im Browser Client, Hooks und ein Dialog im Design von `src/components/projects/new-project/`. Spec: `docs/superpowers/specs/2026-11-05-new-task-form-design.md`.

**Tech Stack:** Astro 7, React 19, `@directus/sdk` 25, Vitest 3, sonner, Tailwind/shadcn (`@workspace/ui`).

## Global Constraints

- Arbeitsverzeichnis `apps/web`; Alias `@/` = `src/`. Tests `npm test`, Typecheck `npx astro check` (0 errors), `npx eslint src`; Prettier nur auf geänderte Dateien.
- Kommentare/UI-Texte deutsch, Bezeichner englisch; kein Semikolon, doppelte Anführungszeichen, 2 Leerzeichen.
- Alle Directus-Zugriffe mit dem Token der angemeldeten Person (`createUserClient` aus `@/services/directus/client`); nie einen statischen Token verwenden, nie ein Token ausgeben oder committen.
- `tasks.status` immer `"published"`, `completed` `false`, `assigned_to` = `session.user.id` (die Agentur-Rolle darf `directus_users` nicht auflisten).
- Eine Aufgabe gehört immer zu einem Projekt: `printing_lines` ist Pflicht (Browser und Server), das Projekt muss `status` `created` oder `in progress` haben.
- Fälligkeitsdatum ist Pflicht (`YYYY-MM-DD`, Vergangenheit erlaubt), sonst blendet `toTrackedTasks` die Aufgabe aus.
- Formular und Routen nur für `canViewInternalWork(role)` (`@/lib/auth/roles`); sonst `403`.
- Logs: nur Status/Codes (`toErrorResponse` aus `@/lib/customer-contact-form/error-response`), nie Formularinhalte.
- Nicht anfassen: `scripts/` (untracked), `.superpowers/`, bestehende Projekt-Formular-Dateien (eigene Dateien für Aufgaben anlegen, gemeinsame Bausteine `FormSelect`, `FormField`, `SettingsInput`, `SUBMIT_TIMEOUT_MS` wiederverwenden).
- Vorbild für jede Datei: die gleichnamige im Projekt-Formular (`src/services/projects/new-project.*`, `src/pages/api/projects/*`, `src/hooks/use-new-project-form.ts`, `use-project-options.ts`, `src/components/projects/new-project/*`, `src/services/projects/projects.client.ts`).

## File Structure

| Datei | Verantwortung |
|---|---|
| `src/services/tasks/new-task.values.ts` | `NewTaskValues`, leere Werte, Typ-Guard |
| `src/services/tasks/new-task.validation.ts` | `validateNewTask(values)` + `MAX_LENGTH` |
| `src/services/tasks/new-task.types.ts` | `TaskOptions`, Directus-Zeilentypen |
| `src/services/tasks/new-task.mapper.ts` | `toTaskPayload`, `toTaskOptions`, `computeDueDate` (rein) |
| `src/services/tasks/new-task.repository.ts` | `fetchTaskOptions`, `fetchTaskProject`, `createTask` |
| `src/services/tasks/new-task.handlers.ts` | `handleCreateTask`, `handleTaskOptions` |
| `src/pages/api/tasks/index.ts`, `options.ts` | Routen (`[id].ts` besteht bereits) |
| `src/services/tasks/tasks.client.ts` | `submitNewTask` ergänzen |
| `src/hooks/use-task-options.ts`, `use-new-task-form.ts` | Zustand |
| `src/components/tasks/new-task/*` | Dialog und Feldgruppen |
| `src/i18n/de.ts`, `en.ts`, `src/components/tasks/tasks-page.tsx` | Texte und Anbindung |

---

### Task 1: Werte und Validierung

**Files:** Create `src/services/tasks/new-task.values.ts`, `new-task.validation.ts`; Test `new-task.validation.test.ts` (alle in `src/services/tasks/`).

**Interfaces — Produces:**
```ts
export type TaskPriority = "high" | "medium" | "low"   // bereits in @/models/task: importieren, nicht neu definieren
export const PRIORITIES = ["high", "medium", "low"] as const
export type NewTaskValues = {
  templateId: string   // "" oder UUID (nur Anzeige/Vorbelegung, wird nicht gespeichert)
  name: string
  projectId: string    // UUID
  dueDate: string      // YYYY-MM-DD
  priority: TaskPriority
  description: string
}
export const EMPTY_NEW_TASK_VALUES: NewTaskValues   // priority "medium", Rest ""
export function isNewTaskValues(body: unknown): body is NewTaskValues
export const MAX_LENGTH = { name: 200, description: 2000 } as const
export type TaskValidationCode = "required" | "invalid" | "tooLong"
export type TaskValidationErrors = Partial<Record<keyof NewTaskValues, TaskValidationCode>>
export function validateNewTask(values: NewTaskValues): TaskValidationErrors
```
Regeln: `name` leer/Leerzeichen → `required`, `length > 200` → `tooLong`; `projectId` leer → `required`, kein UUID → `invalid`; `dueDate` leer → `required`, kein echtes Kalenderdatum → `invalid`; `templateId` leer erlaubt, sonst kein UUID → `invalid`; `priority` nicht in `PRIORITIES` → `invalid`; `description` `length > 2000` → `tooLong`. `isNewTaskValues`: Objekt, alle Schlüssel Strings, `priority` ∈ `PRIORITIES`. Wiederverwenden: `isUuid` (`@/utils/is-uuid`), `isDate` aus `@/services/time-entries/time-entries.mapper` (YYYY-MM-DD plus echtes Kalenderdatum). Muster: `src/services/projects/new-project.validation.ts` und `.values.ts`.

- [ ] **Step 1:** Test schreiben: gültige Werte → `{}`; jedes Pflichtfeld leer → `required`; `dueDate` "2026-02-30" und "2026-1-1" → `invalid`; Vergangenheitsdatum "2020-01-01" → ok; `projectId` "abc" → `invalid`; `priority` "urgent" → `invalid`; Name 201 Zeichen → `tooLong`, genau 200 → ok; Beschreibung 2001 → `tooLong`; `templateId` "" ok, "x" → `invalid`; `isNewTaskValues` gültig → true, Feld fehlt → false, `priority: "x"` → false, `null` → false.
- [ ] **Step 2:** `npx vitest run src/services/tasks/new-task.validation.test.ts` → FAIL.
- [ ] **Step 3:** Dateien implementieren. **Step 4:** Test → PASS. **Step 5:** Commit `feat(web): add new task form values and validation`.

---

### Task 2: Typen, Mapper und Repository

**Files:** Create `src/services/tasks/new-task.types.ts`, `new-task.mapper.ts`, `new-task.repository.ts`; Test `new-task.mapper.test.ts`.

**Interfaces — Produces:**
```ts
// types
export type DueDateAnchor = "date_created" | "pal_date" | "delivery_date" | "distribution_date"
export type TaskOptions = {
  projects: { id: string; name: string; customer: string; palDate: string | null; deliveryDate: string | null; distributionDate: string | null }[]
  templates: { id: string; name: string; description: string; anchor: DueDateAnchor; offset: number }[]
}
// mapper (rein)
export function computeDueDate(
  template: { anchor: DueDateAnchor; offset: number },
  project: { palDate: string | null; deliveryDate: string | null; distributionDate: string | null } | undefined,
  today: string
): string                       // YYYY-MM-DD oder ""
export function toTaskPayload(values: NewTaskValues, userId: string): Record<string, unknown>
export function toTaskOptions(rows: TaskOptionRows): TaskOptions
// repository
export async function fetchTaskOptions(accessToken: string): Promise<TaskOptions>
export async function fetchTaskProject(accessToken: string, projectId: string): Promise<{ status: string | null }>
export async function createTask(accessToken: string, values: NewTaskValues, userId: string): Promise<{ id: string; name: string }>
```
- `computeDueDate`: Anker `date_created` → `today + offset`; sonst das passende Projektdatum + `offset`; fehlt Projekt/Datum → `""`. Datum-Arithmetik rein in UTC auf den Stringwerten (`new Date(`${d}T00:00:00Z`)`, `setUTCDate(getUTCDate()+offset)`, `toISOString().slice(0,10)`), negativer Offset erlaubt, Monats-/Jahreswechsel korrekt.
- `toTaskPayload`: `task_name: name.trim()`, `description: description.trim() || null`, `priority`, `due_date`, `printing_lines: projectId`, `assigned_to: userId`, `status: "published"`, `completed: false`.
- `toTaskOptions`: Projekte `{ id, name: name ?? "", customer: tenant.tenant_name ?? "", palDate: pal_date, deliveryDate: delivery_date, distributionDate: distribution_date }`; Vorlagen `{ id, name: task_name, description: description ?? "", anchor: due_date_anchor, offset: due_date_offset }`.
- Repository (Muster `new-project.repository.ts`, `createUserClient`): `fetchTaskOptions` → `Promise.all` aus `readItems("printing_lines", { fields: ["id","name","pal_date","delivery_date","distribution_date","tenant.tenant_name"], filter: { status: { _in: ["created","in progress"] } }, sort: ["pal_date"], limit: -1 })` und `readItems("task_templates", { fields: ["id","task_name","description","due_date_anchor","due_date_offset"], filter: { status: { _eq: "published" } }, sort: ["sort"], limit: -1 })`; `fetchTaskProject` → `readItem("printing_lines", id, { fields: ["status"] })`; `createTask` → `createItem("tasks", toTaskPayload(...), { fields: ["id","task_name"] })`, Ergebnis `{ id, name: task_name }`.

- [ ] **Step 1:** Mapper-Test: `computeDueDate` (`date_created` + 2 → heute+2; `pal_date` mit Offset -3 über Monatsgrenze, z. B. PAL "2026-12-02" −3 → "2026-11-29"; Jahreswechsel; Projekt ohne `distributionDate` bei Anker `distribution_date` → `""`; kein Projekt bei Anker `pal_date` → `""`; kein Projekt bei `date_created` → trotzdem Datum), `toTaskPayload` (Trim, `description` leer → `null`, feste Felder), `toTaskOptions`.
- [ ] **Step 2:** Test → FAIL. **Step 3:** Types, Mapper, Repository implementieren. **Step 4:** Test → PASS; `npx astro check` 0 errors. **Step 5:** Commit `feat(web): add new task mapper and Directus repository`.

---

### Task 3: Handler und API-Routen

**Files:** Create `src/services/tasks/new-task.handlers.ts`, `src/pages/api/tasks/index.ts`, `src/pages/api/tasks/options.ts`; Test `new-task.handlers.test.ts`.

**Interfaces — Produces:**
```ts
export type CreateTaskDeps = { fetchProject: typeof fetchTaskProject; create: typeof createTask }
export async function handleCreateTask(request: Request, session: { tokens: { accessToken: string }; user: { id: string; role: string | null } }, deps?: Partial<CreateTaskDeps>): Promise<Response>
export async function handleTaskOptions(session, fetchOptions?: typeof fetchTaskOptions): Promise<Response>
```
Reihenfolge `handleCreateTask`: (1) `!canViewInternalWork(role)` → `403 {error:"forbidden"}` (vor dem Body-Parsen); (2) `readJsonBody` + `isNewTaskValues`, sonst `400 {error:"invalid_body"}`; (3) `validateNewTask` nicht leer → `400 {error:"invalid_fields", fields}`; (4) `fetchProject`: Directus 403/404 (`getDirectusStatus`) → `400 {error:"invalid_project"}`, andere Fehler → `toErrorResponse(error,"Directus task project lookup","create_failed")`; (5) Status nicht `created`/`in progress` → `400 {error:"invalid_project"}`; (6) `create(token, body, session.user.id)` → `201 {id, name}`, Fehler → `toErrorResponse(error,"Directus task create","create_failed")`. `handleTaskOptions`: ohne Berechtigung `403`, sonst `200` mit den Optionen, Fehler → `toErrorResponse(error,"Directus task options","options_failed")`. Muster: `new-project.handlers.ts` und `src/pages/api/projects/*`; `src/pages/api/tasks/[id].ts` bleibt unverändert.

- [ ] **Step 1:** Handler-Test (Funktionen als `vi.fn()` injiziert; Directus-Fehler realistisch simulieren wie in `new-project.handlers.test.ts`): Kunden-Rolle → 403 und `create` nicht aufgerufen, auch bei kaputtem Body; kaputter Body → 400 `invalid_body`; leerer Titel → 400 `invalid_fields` mit `fields.name === "required"`; fehlendes Projekt (`projectId` leer) → `invalid_fields`; Projekt 404/403 → `invalid_project`; Projekt `completed` → `invalid_project`; Projekt 500 → 502; Erfolg → 201 `{id,name}` und `create` mit `userId` aus der Session; `create` 422 → 400 `create_failed`; `create` 500 → 502 ohne Inhalte im Body und ohne Inhalt in `console.error`; Options: Kunde → 403, Agentur → 200.
- [ ] **Step 2:** FAIL → **Step 3:** implementieren → **Step 4:** PASS, `npm test`, `npx astro check`, `npx eslint src`. **Step 5:** Commit `feat(web): add create task API route and options route`.

---

### Task 4: Client, Hooks, Dialog und Anbindung

**Files:** Modify `src/services/tasks/tasks.client.ts`, `src/i18n/de.ts`, `src/i18n/en.ts` (`tasksPage.form`), `src/components/tasks/tasks-page.tsx`; Create `src/hooks/use-task-options.ts`, `src/hooks/use-new-task-form.ts`, `src/components/tasks/new-task/` (`new-task-form.tsx`, Feldgruppen, `form-helpers.ts` + Test); Test `src/services/tasks/tasks.client.test.ts` (erweitern oder neu).

**Interfaces — Produces:**
```ts
export type SubmitTaskResult =
  | { ok: true; id: string; name: string }
  | { ok: false; error: string; fields?: TaskValidationErrors }
export async function submitNewTask(values: NewTaskValues): Promise<SubmitTaskResult>   // POST /api/tasks, 20 s Timeout (SUBMIT_TIMEOUT_MS), Netzwerkfehler → "network_error"
export function useTaskOptions(): { state: ...; retry: () => void }                      // GET /api/tasks/options
export function useNewTaskForm(args: { formRef; onCreated: (name: string) => void; onSavingChange: (s: boolean) => void; options? }): { values; errors; saving; submitError; setField; setTemplate; setProject; submit }
```
Verhalten (identisch zum Projekt-Dialog, nur andere Felder): Dialog `NewTaskForm({ open, onClose, onCreated, t })` `max-w-2xl`; nicht schließbar beim Speichern; Body nur bei geöffnetem Dialog gerendert; Lade-/Fehler-/Retry-/403-Zustand; Fußzeile mit Fehlermeldung, Abbrechen, Speichern; Fokus aufs erste fehlerhafte Feld; Serverfehler `invalid_fields` auf die Felder legen; Fehlercodes `unauthorized`, `forbidden`, `invalid_project` (eigener Text: Projekt nicht mehr verfügbar), sonst allgemeiner Speicherfehler.
- Felder: Vorlage (`FormSelect`, mit `emptyLabel` „Ohne Vorlage"), Titel, Projekt (Pflicht, Label „Projekt", Option `Projektname – Kunde`), Fälligkeit (`type="date"`, Pflicht), Priorität (`FormSelect`, Standard Mittel, ohne Leer-Eintrag), Beschreibung (Textarea wie `project-notes-fields.tsx`).
- `setTemplate(id)`: setzt `templateId`, füllt `name` (Vorlagentitel), `description` und `dueDate` (`computeDueDate` mit gewähltem Projekt und `toDayKey(new Date())`); `id` leer → nur `templateId` leeren, Werte bleiben. `setProject(id)`: setzt `projectId`; ist eine Vorlage gewählt und wurde `dueDate` seit der letzten automatischen Vorbelegung nicht von Hand geändert, wird sie neu berechnet (Merker `dueDateTouched` im Hook; `setField("dueDate", …)` setzt ihn auf `true`, `setTemplate` auf `false`).
- Clientseitig `validateNewTask(values)`; Texte unter `tasksPage.form` in `de.ts` und `en.ts` (Titel „Neue Aufgabe", Beschreibung, Pflichthinweis, Labels, Platzhalter, Validierung je Code, Fehler, `created: "Aufgabe „{name}“ wurde angelegt."`, Laden, Erneut versuchen, Abbrechen, Anlegen/Speichert…), Typ aus dem Dictionary ableiten, beide Sprachen schlüsselgleich.
- `TasksPage`: `CreateButton onClick` öffnet den Dialog; `onCreated` → Dialog zu, `toast.success(fillTemplate(dict.form.created, { name }))`, `window.location.reload()` nach 800 ms (Timer in `useRef`, im Effekt-Cleanup löschen); `Toaster` besteht bereits.

- [ ] **Step 1:** Tests: Client (201 → ok mit id/name; 400 `invalid_fields` → Felder; 403 → `forbidden`; `fetch` wirft → `network_error`; Antwort ohne JSON → `server_error`), Form-Helfer (Projekt-Optionen `Name – Kunde`, Vorlagen-Optionen, Vorbelegung Fälligkeit, `dueDateTouched`-Logik als reine Funktion).
- [ ] **Step 2:** FAIL → Client und Helfer implementieren → PASS. **Step 3:** Hooks, Dialog, Feldgruppen, i18n, Anbindung; Dateien klein halten. **Step 4:** `npm test` grün, `npx astro check` 0 errors, `npx eslint src`, Prettier auf geänderte Dateien. **Step 5:** Commit `feat(web): add new task dialog to the tasks page`.

---

### Task 5 (Controller): Live-Prüfung

Mit Agentur-Login (Passwort nur im Chat, nie in Dateien): Options-Route (Kunden-Rolle 403), Aufgabe frei und aus Vorlage anlegen, in Directus lesen (`printing_lines` gesetzt, `status published`, `assigned_to` = ich, `due_date`, `priority`), Fehlerfälle (ohne Projekt, abgeschlossenes Projekt). Testdaten erst nach Freigabe löschen.
