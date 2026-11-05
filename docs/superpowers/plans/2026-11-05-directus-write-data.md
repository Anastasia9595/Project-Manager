# Frontend schreibt nach Directus (Teil 2 und 3) – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Abhaken, Aufgaben-Timer und Zeiterfassung speichern in Directus (über API-Routen und die Service-Schicht aus Teil 1) statt im Browser.

**Architecture:** Komponenten rufen dünne Browser-Clients (`*.client.ts`) auf, die `fetch` auf `src/pages/api/…` machen. Die Routen (`withSession`) delegieren an Handler (Validierung, Antwort) und Repositories (Directus SDK mit dem Token der Person) in `src/services/tasks` und `src/services/time-entries`. Mapper sind rein und getestet. Der laufende Timer bleibt im Browser; nur der fertige Eintrag geht nach Directus.

**Tech Stack:** Astro 7 + React 19, TypeScript strict, `@directus/sdk` 25, Zustand, Sonner, Vitest 3.

**Spec:** `docs/superpowers/specs/2026-11-05-directus-write-data-design.md`

## Global Constraints

- Alle Befehle aus `apps/web` ausführen, sofern nicht anders angegeben. Tests `npm test`; Typecheck `npx astro check` → `0 errors`; Lint `npx eslint src` → keine Ausgabe.
- Prettier nur auf geänderte/neue Dateien. Kommentare und Testnamen auf Deutsch, Kommentare nur für das Warum. Imports mit Alias `@/…`.
- Directus nur mit `createUserClient(accessToken)` (Token der Person) aus `@/services/directus/client`.
- API-Routen: `withSession` aus `@/lib/auth/with-session`; Antworten mit `jsonResponse` aus `@/utils/json-response`; Body mit `readJsonBody` aus `@/utils/read-json-body`; Directus-Fehler mit `toErrorResponse(error, context, rejectedCode)` aus `@/lib/customer-contact-form/error-response`.
- Zeiterfassung und Timer nur für Admin/Agentur (`canViewInternalWork` aus `@/lib/auth/roles`).
- Timer: Minuten = `Math.max(1, Math.round(seconds / 60))`, `work_date` = Tag von `startedAt` in Ortszeit (`toDayKey`).
- Kein Token oder Passwort in Dateien, Commits oder Ausgaben.
- Commit-Messages enden mit `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

---

### Task 1: Aufgabe abhaken – Service, Handler, Route, Client

**Files:**
- Modify: `src/services/tasks/tasks.repository.ts` (neue Funktion `updateTaskCompletion`)
- Create: `src/services/tasks/tasks.handlers.ts`, `src/services/tasks/tasks.handlers.test.ts`
- Create: `src/pages/api/tasks/[id].ts`
- Create: `src/services/tasks/tasks.client.ts`

**Interfaces:**
- Produces: `updateTaskCompletion(accessToken: string, id: string, completed: boolean): Promise<{ id: string; completed: boolean; completedAt: string | null }>`; `handleUpdateTask(request: Request, id: string, accessToken: string, update?: typeof updateTaskCompletion): Promise<Response>`; `setTaskCompleted(id: string, completed: boolean): Promise<void>` (wirft bei Fehler).

- [ ] **Step 1: Failing Test** – `src/services/tasks/tasks.handlers.test.ts`

```ts
import { describe, expect, it, vi } from "vitest"

import { handleUpdateTask } from "@/services/tasks/tasks.handlers"

const request = (body: unknown) =>
  new Request("http://x/api/tasks/t1", { method: "PATCH", body: JSON.stringify(body) })

describe("handleUpdateTask", () => {
  it("speichert den Erledigt-Status und antwortet mit completedAt", async () => {
    const update = vi.fn().mockResolvedValue({ id: "t1", completed: true, completedAt: "2026-11-05T10:00:00.000Z" })
    const response = await handleUpdateTask(request({ completed: true }), "t1", "token", update)
    expect(update).toHaveBeenCalledWith("token", "t1", true)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: "t1", completed: true, completedAt: "2026-11-05T10:00:00.000Z" })
  })

  it("lehnt ungültige Bodys mit 400 ab, ohne Directus aufzurufen", async () => {
    const update = vi.fn()
    for (const body of [null, {}, { completed: "ja" }, []]) {
      const response = await handleUpdateTask(request(body), "t1", "token", update)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: "invalid_body" })
    }
    expect(update).not.toHaveBeenCalled()
  })

  it("antwortet bei Netzwerkfehlern mit 502", async () => {
    const update = vi.fn().mockRejectedValue(new Error("down"))
    const response = await handleUpdateTask(request({ completed: false }), "t1", "token", update)
    expect(response.status).toBe(502)
  })
})
```

Run: `npx vitest run src/services/tasks/tasks.handlers.test.ts` → FAIL (Import nicht auflösbar)

- [ ] **Step 2: Repository-Funktion** – in `src/services/tasks/tasks.repository.ts` den Import auf `import { readItems, updateItem } from "@directus/sdk"` erweitern und anhängen:

```ts
/** Setzt den Erledigt-Status; `completed_at` wird mit gesetzt bzw. geleert. Directus prüft, ob die Person die Aufgabe ändern darf. */
export async function updateTaskCompletion(
  accessToken: string,
  id: string,
  completed: boolean
): Promise<{ id: string; completed: boolean; completedAt: string | null }> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    updateItem(
      "tasks",
      id,
      { completed, completed_at: completed ? new Date().toISOString() : null },
      { fields: ["id", "completed", "completed_at"] }
    )
  )) as unknown as { id: string; completed: boolean; completed_at: string | null }
  return { id: row.id, completed: row.completed, completedAt: row.completed_at }
}
```

- [ ] **Step 3: Handler** – `src/services/tasks/tasks.handlers.ts`

```ts
import { toErrorResponse } from "@/lib/customer-contact-form/error-response"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

import { updateTaskCompletion } from "./tasks.repository"

function isCompletionBody(body: unknown): body is { completed: boolean } {
  return (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    typeof (body as { completed?: unknown }).completed === "boolean"
  )
}

/** Logik der Route PATCH /api/tasks/[id]; die Route prüft nur die Anmeldung, die Directus-Rechte entscheiden den Rest. */
export async function handleUpdateTask(
  request: Request,
  id: string,
  accessToken: string,
  update: typeof updateTaskCompletion = updateTaskCompletion
): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isCompletionBody(body)) return jsonResponse(400, { error: "invalid_body" })
  try {
    return jsonResponse(200, await update(accessToken, id, body.completed))
  } catch (error) {
    return toErrorResponse(error, "Directus task update", "invalid_body")
  }
}
```

Run: `npx vitest run src/services/tasks/tasks.handlers.test.ts` → PASS (3 Tests)

- [ ] **Step 4: Route und Client**

`src/pages/api/tasks/[id].ts`:

```ts
import { withSession } from "@/lib/auth/with-session"
import { jsonResponse } from "@/utils/json-response"
import { handleUpdateTask } from "@/services/tasks/tasks.handlers"

export const PATCH = withSession(({ request, params }, session) =>
  params.id
    ? handleUpdateTask(request, params.id, session.tokens.accessToken)
    : jsonResponse(400, { error: "invalid_body" })
)
```

`src/services/tasks/tasks.client.ts`:

```ts
/** Speichert den Erledigt-Status einer Aufgabe; wirft bei Fehlern, damit die Oberfläche zurücksetzen kann. */
export async function setTaskCompleted(id: string, completed: boolean): Promise<void> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  })
  if (!response.ok) throw new Error(`Aufgabe konnte nicht gespeichert werden (${response.status})`)
}
```

- [ ] **Step 5: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

```bash
npx prettier --write src/services/tasks "src/pages/api/tasks/[id].ts"
git add src/services/tasks src/pages/api/tasks
git commit -m "feat(web): add API and services to save task completion in Directus

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Abhaken in „Meine Aufgaben“ und im Kalender

**Files:**
- Create: `src/hooks/use-task-completion.ts`
- Modify: `src/components/dashboard/my-tasks/my-tasks.tsx`, `src/components/calendar/calendar-page.tsx`
- Modify: `src/pages/index.astro`, `src/pages/calendar.astro` (falls nötig)
- Modify: `src/i18n/de.ts`, `src/i18n/en.ts` (Fehlertexte)

**Interfaces:**
- Consumes: `setTaskCompleted` (Task 1).
- Produces: `useTaskCompletion(errorMessage: string): (id: string, completed: boolean, rollback: () => void) => Promise<void>`.

Verhalten: Beim Abhaken oder Wieder-Öffnen wird der Zustand sofort umgestellt; `setTaskCompleted` läuft im Hintergrund; schlägt es fehl, wird der vorherige Zustand wiederhergestellt und `toast.error(<Fehlertext>)` gezeigt.

- [ ] **Step 1: Gemeinsamer Hook** – `src/hooks/use-task-completion.ts`

```ts
import { toast } from "sonner"

import { setTaskCompleted } from "@/services/tasks/tasks.client"

/**
 * Gibt eine Funktion zurück, die den Erledigt-Status speichert. Schlägt das Speichern fehl,
 * wird `rollback` aufgerufen und ein Toast mit `errorMessage` gezeigt.
 */
export function useTaskCompletion(errorMessage: string) {
  return async function saveCompletion(id: string, completed: boolean, rollback: () => void) {
    try {
      await setTaskCompleted(id, completed)
    } catch {
      rollback()
      toast.error(errorMessage)
    }
  }
}
```

- [ ] **Step 2: `my-tasks.tsx`** – das `// TODO: Erledigt-Status in Directus speichern` entfernen; `toggleTask` stellt lokal um und ruft danach `saveCompletion(id, nextDone, () => <lokales Umschalten zurück>)`. Den Fehlertext liefert `index.astro` als neue Prop `saveError` (`dict.dashboard.myTasks.saveError`); dafür in `de.ts`/`en.ts` den Schlüssel `dashboard.myTasks.saveError` anlegen („Die Aufgabe konnte nicht gespeichert werden.“ / „The task could not be saved.“). Falls `dashboard.myTasks` nicht existiert, den Abschnitt neu anlegen.

- [ ] **Step 3: `calendar-page.tsx`** – `setTaskDone(taskId, done)` bleibt die lokale Änderung; `toggleTask` und `confirmReopen` rufen zusätzlich `saveCompletion(taskId, done, () => setTaskDone(taskId, !done))`. Fehlertext: neuer Schlüssel `calendarPage.saveError` (de/en wie oben), aus dem vorhandenen `labels`-Objekt der Komponente.

- [ ] **Step 4: Toaster** – `grep -rn "Toaster" src` zeigt, dass `<Toaster />` (aus `@workspace/ui/components/sonner`) nur in `time-tracking-workspace.tsx` gerendert wird. Je einen `<Toaster />` in der Dashboard-Insel `MyTasks` und in `calendar-page.tsx` ergänzen, sodass Fehler-Toasts sichtbar sind; keinen zweiten auf Seiten, die schon einen haben.

- [ ] **Step 5: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

```bash
npx prettier --write src/hooks/use-task-completion.ts src/components/dashboard/my-tasks/my-tasks.tsx src/components/calendar/calendar-page.tsx src/pages/index.astro src/i18n/de.ts src/i18n/en.ts
git add -A src
git commit -m "feat(web): save task completion from dashboard and calendar to Directus

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Zeiteinträge – Service, Handler und Routen

**Files:**
- Modify: `src/services/time-entries/time-entries.types.ts`, `src/services/time-entries/time-entries.mapper.ts`
- Create: `src/services/time-entries/time-entries.mapper.test.ts`, `time-entries.repository.ts`, `time-entries.handlers.ts`, `time-entries.handlers.test.ts`, `test-support.ts`
- Create: `src/pages/api/time-entries/index.ts`, `src/pages/api/time-entries/booked-tasks.ts`, `src/pages/api/time-entries/[id].ts`

**Interfaces:**
- Consumes: `createUserClient`, `TimeBooking` aus `@/models/time-booking`, `splitMinutes`/`MINUTES_PER_HOUR` aus `@/lib/time-tracking/calculations/duration`, `addDays`/`parseDayKey`/`toDayKey` aus `@/lib/week`.
- Produces:
  - Typen `TimeBookingRow`, `TimeEntryWrite`, `WritableBooking` (`{ task; date; duration_minutes; description }`)
  - `toEntryMinutes` (besteht), `toTimeBooking`, `toTimeEntryWrite`, `toTimeEntryChanges`, `isWritableBooking`, `isBookingChanges`
  - Repository: `fetchWeekEntries`, `fetchBookedTaskIds`, `createTimeEntry`, `updateTimeEntry`, `deleteTimeEntry`
  - Handler: `handleListEntries(url, accessToken, list?)`, `handleBookedTasks(accessToken, load?)`, `handleCreateEntry(request, accessToken, create?)`, `handleUpdateEntry(request, id, accessToken, update?)`, `handleDeleteEntry(id, accessToken, remove?)`

- [ ] **Step 1: Typen ergänzen** – an `time-entries.types.ts` anhängen:

```ts
/** Zeile aus `time_entries` für die Zeiterfassung (mit Aufgabe und Druckstrecke). */
export type TimeBookingRow = {
  id: string
  work_date: string
  hours: number | null
  minutes: number | null
  note: string | null
  user_created: string | null
  task: { id: string; printing_lines: { id: string } | null } | null
}

/** Felder, die beim Anlegen/Ändern nach Directus geschrieben werden. */
export type TimeEntryWrite = {
  task: string
  work_date: string
  hours: number
  minutes: number
  note: string | null
}

/** Von der API akzeptierte Buchungsdaten (`project` und `user` bestimmt der Server aus Aufgabe bzw. Session). */
export type WritableBooking = {
  task: string
  date: string
  duration_minutes: number
  description: string | null
}
```

- [ ] **Step 2: Failing Mapper-Test** – `time-entries.mapper.test.ts`

```ts
import { describe, expect, it } from "vitest"

import {
  isBookingChanges,
  isWritableBooking,
  toTimeBooking,
  toTimeEntryChanges,
  toTimeEntryWrite,
} from "@/services/time-entries/time-entries.mapper"

describe("toTimeBooking", () => {
  it("bildet eine Directus-Zeile auf eine Buchung ab", () => {
    expect(
      toTimeBooking({
        id: "e1", work_date: "2026-11-04", hours: 1, minutes: 30, note: "Satz",
        user_created: "u1", task: { id: "t1", printing_lines: { id: "p1" } },
      })
    ).toEqual({ id: "e1", project: "p1", task: "t1", date: "2026-11-04", duration_minutes: 90, description: "Satz", user: "u1" })
  })

  it("setzt fehlende Werte auf neutrale Standardwerte", () => {
    expect(
      toTimeBooking({ id: "e2", work_date: "2026-11-04", hours: null, minutes: 45, note: null, user_created: null, task: null })
    ).toEqual({ id: "e2", project: "", task: "", date: "2026-11-04", duration_minutes: 45, description: null, user: "" })
  })
})

describe("toTimeEntryWrite", () => {
  it("teilt die Dauer in Stunden und Minuten", () => {
    expect(toTimeEntryWrite({ task: "t1", date: "2026-11-04", duration_minutes: 135, description: null })).toEqual({
      task: "t1", work_date: "2026-11-04", hours: 2, minutes: 15, note: null,
    })
  })

  it("übersetzt Änderungen nur für gelieferte Felder", () => {
    expect(toTimeEntryChanges({ description: "neu" })).toEqual({ note: "neu" })
    expect(toTimeEntryChanges({ duration_minutes: 60, date: "2026-11-05" })).toEqual({ hours: 1, minutes: 0, work_date: "2026-11-05" })
  })
})

describe("Body-Prüfung", () => {
  const ok = { task: "t1", date: "2026-11-04", duration_minutes: 30, description: null }

  it("akzeptiert gültige Buchungen", () => {
    expect(isWritableBooking(ok)).toBe(true)
    expect(isWritableBooking({ ...ok, description: "x".repeat(2000) })).toBe(true)
    expect(isBookingChanges({ description: "x" })).toBe(true)
  })

  it.each([
    [null], [[]], [{ ...ok, task: "" }], [{ ...ok, date: "04.11.2026" }], [{ ...ok, duration_minutes: 0 }],
    [{ ...ok, duration_minutes: 1441 }], [{ ...ok, duration_minutes: 1.5 }], [{ ...ok, description: "x".repeat(2001) }],
  ])("lehnt %j ab", (body) => {
    expect(isWritableBooking(body)).toBe(false)
  })

  it("lehnt leere oder ungültige Änderungen ab", () => {
    expect(isBookingChanges({})).toBe(false)
    expect(isBookingChanges({ duration_minutes: -1 })).toBe(false)
  })
})
```

Run: `npx vitest run src/services/time-entries` → FAIL (Exporte fehlen)

- [ ] **Step 3: Mapper erweitern** – `time-entries.mapper.ts` ersetzen durch:

```ts
import { MINUTES_PER_HOUR, splitMinutes } from "@/lib/time-tracking/calculations/duration"
import type { TimeBooking } from "@/models/time-booking"

import type {
  TimeBookingRow,
  TimeEntryRow,
  TimeEntryWrite,
  WritableBooking,
} from "./time-entries.types"

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const MAX_MINUTES = 24 * MINUTES_PER_HOUR
const MAX_DESCRIPTION_LENGTH = 2000

/** Dauer eines Directus-Zeiteintrags in Minuten (`hours` + `minutes`). */
export function toEntryMinutes(row: Pick<TimeEntryRow, "hours" | "minutes">): number {
  return (row.hours ?? 0) * MINUTES_PER_HOUR + (row.minutes ?? 0)
}

export function toTimeBooking(row: TimeBookingRow): TimeBooking {
  return {
    id: row.id,
    project: row.task?.printing_lines?.id ?? "",
    task: row.task?.id ?? "",
    date: row.work_date,
    duration_minutes: toEntryMinutes(row),
    description: row.note,
    user: row.user_created ?? "",
  }
}

export function toTimeEntryWrite(input: WritableBooking): TimeEntryWrite {
  return {
    task: input.task,
    work_date: input.date,
    ...splitMinutes(input.duration_minutes),
    note: input.description,
  }
}

export function toTimeEntryChanges(changes: Partial<WritableBooking>): Partial<TimeEntryWrite> {
  return {
    ...(changes.task !== undefined && { task: changes.task }),
    ...(changes.date !== undefined && { work_date: changes.date }),
    ...(changes.duration_minutes !== undefined && splitMinutes(changes.duration_minutes)),
    ...(changes.description !== undefined && { note: changes.description }),
  }
}

const isTask = (value: unknown) => typeof value === "string" && value.length > 0
const isDate = (value: unknown) => typeof value === "string" && DAY_KEY.test(value)
const isDuration = (value: unknown) =>
  Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_MINUTES
const isDescription = (value: unknown) =>
  value === null || (typeof value === "string" && value.length <= MAX_DESCRIPTION_LENGTH)

const isObject = (body: unknown): body is Record<string, unknown> =>
  typeof body === "object" && body !== null && !Array.isArray(body)

export function isWritableBooking(body: unknown): body is WritableBooking {
  return (
    isObject(body) &&
    isTask(body.task) &&
    isDate(body.date) &&
    isDuration(body.duration_minutes) &&
    isDescription(body.description)
  )
}

export function isBookingChanges(body: unknown): body is Partial<WritableBooking> {
  if (!isObject(body)) return false
  const checks: [string, (value: unknown) => boolean][] = [
    ["task", isTask],
    ["date", isDate],
    ["duration_minutes", isDuration],
    ["description", isDescription],
  ]
  const present = checks.filter(([key]) => key in body)
  return present.length > 0 && present.every(([key, check]) => check(body[key]))
}
```

Run: `npx vitest run src/services/time-entries` → PASS

- [ ] **Step 4: Repository** – `time-entries.repository.ts`

```ts
import { createItem, deleteItem, readItems, updateItem } from "@directus/sdk"

import { addDays, parseDayKey, toDayKey } from "@/lib/week"
import type { TimeBooking } from "@/models/time-booking"
import { createUserClient } from "@/services/directus/client"

import { toTimeBooking, toTimeEntryChanges, toTimeEntryWrite } from "./time-entries.mapper"
import type { TimeBookingRow, WritableBooking } from "./time-entries.types"

const FIELDS = ["id", "work_date", "hours", "minutes", "note", "user_created", "task.id", "task.printing_lines.id"]

/** Buchungen der angemeldeten Person von Montag `weekStart` bis Sonntag (Format "YYYY-MM-DD"). */
export async function fetchWeekEntries(accessToken: string, weekStart: string): Promise<TimeBooking[]> {
  const client = await createUserClient(accessToken)
  const weekEnd = toDayKey(addDays(parseDayKey(weekStart), 6))
  const rows = (await client.request(
    readItems("time_entries", {
      fields: FIELDS,
      filter: { user_created: { _eq: "$CURRENT_USER" }, work_date: { _between: [weekStart, weekEnd] } },
      sort: ["work_date", "date_created"],
      limit: -1,
    })
  )) as unknown as TimeBookingRow[]
  return rows.map(toTimeBooking)
}

/** IDs aller Aufgaben, auf die die angemeldete Person mindestens einmal gebucht hat. */
export async function fetchBookedTaskIds(accessToken: string): Promise<string[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("time_entries", {
      fields: ["task"],
      filter: { user_created: { _eq: "$CURRENT_USER" } },
      limit: -1,
    })
  )) as unknown as { task: string }[]
  return [...new Set(rows.map((row) => row.task))]
}

export async function createTimeEntry(accessToken: string, input: WritableBooking): Promise<TimeBooking> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    createItem("time_entries", toTimeEntryWrite(input), { fields: FIELDS })
  )) as unknown as TimeBookingRow
  return toTimeBooking(row)
}

export async function updateTimeEntry(
  accessToken: string,
  id: string,
  changes: Partial<WritableBooking>
): Promise<TimeBooking> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    updateItem("time_entries", id, toTimeEntryChanges(changes), { fields: FIELDS })
  )) as unknown as TimeBookingRow
  return toTimeBooking(row)
}

export async function deleteTimeEntry(accessToken: string, id: string): Promise<void> {
  const client = await createUserClient(accessToken)
  await client.request(deleteItem("time_entries", id))
}
```

`fetchBookedTaskIds` lädt bewusst alle eigenen Zeilen und dedupliziert im Code (einfach, unabhängig von `groupBy`); bei sehr vielen Einträgen später auf eine Aggregation umstellen.

- [ ] **Step 5: Test-Hilfe und Failing Handler-Test**

`src/services/time-entries/test-support.ts`:

```ts
/** Erzeugt einen Fehler, den das Directus SDK als Directus-Fehler mit HTTP-Status erkennt (nur für Tests). */
export function createDirectusError(status: number): Error {
  return Object.assign(new Error("directus"), {
    errors: [{ message: "x", extensions: { code: "X" } }],
    response: { status },
  })
}
```

Prüfe in `node_modules/@directus/sdk` (`isDirectusError`), welche Form der Fehler haben muss, und passe `createDirectusError` an, falls der Test unten sonst nicht 403 liefert.

`time-entries.handlers.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest"

import {
  handleBookedTasks,
  handleCreateEntry,
  handleDeleteEntry,
  handleListEntries,
  handleUpdateEntry,
} from "@/services/time-entries/time-entries.handlers"
import { createDirectusError } from "@/services/time-entries/test-support"

const json = (body: unknown, method = "POST") =>
  new Request("http://x/api/time-entries", { method, body: JSON.stringify(body) })
const booking = { id: "e1", project: "p1", task: "t1", date: "2026-11-04", duration_minutes: 30, description: null, user: "u1" }
const valid = { task: "t1", date: "2026-11-04", duration_minutes: 30, description: null }

describe("handleCreateEntry", () => {
  it("legt an und antwortet mit 201", async () => {
    const create = vi.fn().mockResolvedValue(booking)
    const response = await handleCreateEntry(json(valid), "token", create)
    expect(create).toHaveBeenCalledWith("token", valid)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual(booking)
  })

  it("lehnt ungültige Bodys mit 400 ab", async () => {
    const create = vi.fn()
    const response = await handleCreateEntry(json({ ...valid, duration_minutes: 0 }), "token", create)
    expect(response.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })
})

describe("handleUpdateEntry", () => {
  it("ändert und antwortet mit 200", async () => {
    const update = vi.fn().mockResolvedValue(booking)
    const response = await handleUpdateEntry(json({ description: "x" }, "PATCH"), "e1", "token", update)
    expect(update).toHaveBeenCalledWith("token", "e1", { description: "x" })
    expect(response.status).toBe(200)
  })

  it("lehnt leere Änderungen mit 400 ab", async () => {
    const response = await handleUpdateEntry(json({}, "PATCH"), "e1", "token", vi.fn())
    expect(response.status).toBe(400)
  })
})

describe("handleDeleteEntry", () => {
  it("löscht und antwortet mit 204", async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    const response = await handleDeleteEntry("e1", "token", remove)
    expect(remove).toHaveBeenCalledWith("token", "e1")
    expect(response.status).toBe(204)
  })

  it("reicht Directus-Verbote als 403 durch", async () => {
    const response = await handleDeleteEntry("e1", "token", vi.fn().mockRejectedValue(createDirectusError(403)))
    expect(response.status).toBe(403)
  })
})

describe("Lese-Handler", () => {
  it("liefert die Buchungen der Woche", async () => {
    const list = vi.fn().mockResolvedValue([booking])
    const response = await handleListEntries(new URL("http://x/api/time-entries?week=2026-11-02"), "token", list)
    expect(list).toHaveBeenCalledWith("token", "2026-11-02")
    expect(await response.json()).toEqual({ entries: [booking] })
  })

  it("verlangt einen gültigen Wochenparameter", async () => {
    const response = await handleListEntries(new URL("http://x/api/time-entries?week=heute"), "token", vi.fn())
    expect(response.status).toBe(400)
  })

  it("liefert die gebuchten Aufgaben", async () => {
    const response = await handleBookedTasks("token", vi.fn().mockResolvedValue(["t1"]))
    expect(await response.json()).toEqual({ taskIds: ["t1"] })
  })
})
```

Run: `npx vitest run src/services/time-entries/time-entries.handlers.test.ts` → FAIL (Handler fehlen)

- [ ] **Step 6: Handler** – `time-entries.handlers.ts`

```ts
import { toErrorResponse } from "@/lib/customer-contact-form/error-response"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

import { isBookingChanges, isWritableBooking } from "./time-entries.mapper"
import {
  createTimeEntry,
  deleteTimeEntry,
  fetchBookedTaskIds,
  fetchWeekEntries,
  updateTimeEntry,
} from "./time-entries.repository"

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const CONTEXT = "Directus time entries"

export async function handleListEntries(
  url: URL,
  accessToken: string,
  list: typeof fetchWeekEntries = fetchWeekEntries
): Promise<Response> {
  const week = url.searchParams.get("week") ?? ""
  if (!DAY_KEY.test(week)) return jsonResponse(400, { error: "invalid_week" })
  try {
    return jsonResponse(200, { entries: await list(accessToken, week) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleBookedTasks(
  accessToken: string,
  load: typeof fetchBookedTaskIds = fetchBookedTaskIds
): Promise<Response> {
  try {
    return jsonResponse(200, { taskIds: await load(accessToken) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleCreateEntry(
  request: Request,
  accessToken: string,
  create: typeof createTimeEntry = createTimeEntry
): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isWritableBooking(body)) return jsonResponse(400, { error: "invalid_body" })
  try {
    return jsonResponse(201, { ...(await create(accessToken, body)) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleUpdateEntry(
  request: Request,
  id: string,
  accessToken: string,
  update: typeof updateTimeEntry = updateTimeEntry
): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isBookingChanges(body)) return jsonResponse(400, { error: "invalid_body" })
  try {
    return jsonResponse(200, { ...(await update(accessToken, id, body)) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleDeleteEntry(
  id: string,
  accessToken: string,
  remove: typeof deleteTimeEntry = deleteTimeEntry
): Promise<Response> {
  try {
    await remove(accessToken, id)
    return new Response(null, { status: 204 })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}
```

Run: `npx vitest run src/services/time-entries` → PASS

- [ ] **Step 7: Routen**

`src/pages/api/time-entries/index.ts`:

```ts
import { withSession } from "@/lib/auth/with-session"
import { handleCreateEntry, handleListEntries } from "@/services/time-entries/time-entries.handlers"

export const GET = withSession(({ url }, session) => handleListEntries(url, session.tokens.accessToken))
export const POST = withSession(({ request }, session) => handleCreateEntry(request, session.tokens.accessToken))
```

`src/pages/api/time-entries/booked-tasks.ts`:

```ts
import { withSession } from "@/lib/auth/with-session"
import { handleBookedTasks } from "@/services/time-entries/time-entries.handlers"

export const GET = withSession((_context, session) => handleBookedTasks(session.tokens.accessToken))
```

`src/pages/api/time-entries/[id].ts`:

```ts
import { withSession } from "@/lib/auth/with-session"
import { jsonResponse } from "@/utils/json-response"
import { handleDeleteEntry, handleUpdateEntry } from "@/services/time-entries/time-entries.handlers"

export const PATCH = withSession(({ request, params }, session) =>
  params.id
    ? handleUpdateEntry(request, params.id, session.tokens.accessToken)
    : jsonResponse(400, { error: "invalid_body" })
)
export const DELETE = withSession(({ params }, session) =>
  params.id
    ? handleDeleteEntry(params.id, session.tokens.accessToken)
    : jsonResponse(400, { error: "invalid_body" })
)
```

- [ ] **Step 8: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

```bash
npx prettier --write src/services/time-entries src/pages/api/time-entries
git add src/services/time-entries src/pages/api/time-entries
git commit -m "feat(web): add time entries service, handlers and API routes

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Timer bucht nach Directus

**Files:**
- Modify: `src/lib/task-timer-store.ts`
- Create: `src/lib/task-timer-store.test.ts`, `src/services/time-entries/time-entries.client.ts`, `src/services/time-entries/time-entries.client.test.ts`, `src/hooks/use-stop-timer.ts`
- Modify: `src/components/tasks/task-table/task-timer-button.tsx`, `src/components/tasks/tasks-page.tsx`, `src/components/calendar/calendar-page.tsx`
- Modify: `src/i18n/de.ts`, `src/i18n/en.ts` (Fehlertext `tasksPage.timer.bookError`)

**Interfaces:**
- Produces: `useTaskTimerStore.getState().stop(): TimeEntry | null` (Eintrag zusätzlich in `entries`), `discardEntry(entry: TimeEntry): void`; `bookTimerEntry(entry: TimeEntry): Promise<void>`; `useStopTimer(errorMessage: string): () => void`.

- [ ] **Step 1: Failing Test** – `src/lib/task-timer-store.test.ts`

```ts
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useTaskTimerStore } from "@/lib/task-timer-store"

const storage = new Map<string, string>()
vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => void storage.set(key, value),
  removeItem: (key: string) => void storage.delete(key),
})

beforeEach(() => {
  storage.clear()
  useTaskTimerStore.setState({ active: null, entries: [] })
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 10, 5, 9, 0, 0))
})

describe("task timer store", () => {
  it("stop gibt den fertigen Eintrag zurück und merkt ihn für die Anzeige", () => {
    const { start, stop } = useTaskTimerStore.getState()
    start("t1")
    vi.setSystemTime(new Date(2026, 10, 5, 9, 1, 30))
    const entry = stop()
    expect(entry).toEqual({ taskId: "t1", startedAt: new Date(2026, 10, 5, 9, 0, 0), seconds: 90 })
    expect(useTaskTimerStore.getState().active).toBeNull()
    expect(useTaskTimerStore.getState().entries).toEqual([entry])
  })

  it("stop ohne laufenden Timer liefert null", () => {
    expect(useTaskTimerStore.getState().stop()).toBeNull()
  })

  it("discardEntry entfernt einen Eintrag wieder", () => {
    const { start, stop, discardEntry } = useTaskTimerStore.getState()
    start("t1")
    const entry = stop()!
    discardEntry(entry)
    expect(useTaskTimerStore.getState().entries).toEqual([])
  })

  it("speichert nur den laufenden Timer, nicht die Einträge", () => {
    const { start, stop } = useTaskTimerStore.getState()
    start("t1")
    stop()
    start("t2")
    const persisted = JSON.parse(storage.get("project-tracker:task-timer")!)
    expect(persisted.state.active.taskId).toBe("t2")
    expect(persisted.state.entries).toBeUndefined()
  })
})
```

Run: `npx vitest run src/lib/task-timer-store.test.ts` → FAIL (`discardEntry` fehlt; `stop` gibt nichts zurück)

- [ ] **Step 2: Store anpassen** – in `src/lib/task-timer-store.ts`:
  - Den Kommentar `// TODO: Zeiteinträge in Directus speichern …` ersetzen durch `// Der laufende Timer liegt im Browser; fertige Einträge speichert der Aufrufer in Directus (siehe useStopTimer).`
  - `TaskTimerState`: `stop: () => TimeEntry | null` und `discardEntry: (entry: TimeEntry) => void`; Kommentar zu `entries`: „Sitzungszustand: in dieser Sitzung beendete Einträge für die sofortige Anzeige; nach dem Neuladen kommen sie aus Directus.“
  - `stop` gibt den neuen Eintrag zurück (`null`, wenn kein Timer läuft); `discardEntry` entfernt per Referenzvergleich (`entries.filter((item) => item !== entry)`).
  - `partialize: ({ active }) => ({ active })`, `version: 2` und `migrate: (state) => ({ active: (state as { active?: ActiveTimer | null }).active ?? null })`, damit alte gespeicherte Einträge verworfen werden.

Run: `npx vitest run src/lib/task-timer-store.test.ts` → PASS (4 Tests)

- [ ] **Step 3: Client mit Test** – `src/services/time-entries/time-entries.client.ts`

```ts
import { toDayKey } from "@/lib/week"
import type { TimeEntry } from "@/models/task"

const SECONDS_PER_MINUTE = 60

/** Bucht einen beendeten Timer-Eintrag nach Directus; wirft bei Fehlern. Mindestens 1 Minute, auf volle Minuten gerundet. */
export async function bookTimerEntry(entry: TimeEntry): Promise<void> {
  const response = await fetch("/api/time-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: entry.taskId,
      date: toDayKey(entry.startedAt),
      duration_minutes: Math.max(1, Math.round(entry.seconds / SECONDS_PER_MINUTE)),
      description: null,
    }),
  })
  if (!response.ok) throw new Error(`Zeit konnte nicht gebucht werden (${response.status})`)
}
```

`time-entries.client.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest"

import { bookTimerEntry } from "@/services/time-entries/time-entries.client"

afterEach(() => vi.unstubAllGlobals())

describe("bookTimerEntry", () => {
  const entry = (seconds: number) => ({ taskId: "t1", startedAt: new Date(2026, 10, 5, 23, 50), seconds })

  it("bucht gerundete Minuten am Starttag", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    await bookTimerEntry(entry(90))
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({ task: "t1", date: "2026-11-05", duration_minutes: 2, description: null })
  })

  it("bucht mindestens eine Minute", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    await bookTimerEntry(entry(10))
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).duration_minutes).toBe(1)
  })

  it("wirft, wenn die API ablehnt", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 403 })))
    await expect(bookTimerEntry(entry(60))).rejects.toThrow()
  })
})
```

Run: `npx vitest run src/services/time-entries/time-entries.client.test.ts` → PASS (3 Tests)

- [ ] **Step 4: Hook** – `src/hooks/use-stop-timer.ts`

```ts
import { toast } from "sonner"

import { useTaskTimerStore } from "@/lib/task-timer-store"
import { bookTimerEntry } from "@/services/time-entries/time-entries.client"

/** Stoppt den Timer und bucht die Zeit nach Directus; bei einem Fehler wird der Eintrag verworfen und ein Toast gezeigt. */
export function useStopTimer(errorMessage: string) {
  return function stopTimer() {
    const { stop, discardEntry } = useTaskTimerStore.getState()
    const entry = stop()
    if (!entry) return
    bookTimerEntry(entry).catch(() => {
      discardEntry(entry)
      toast.error(errorMessage)
    })
  }
}
```

- [ ] **Step 5: Aufrufer umstellen** – `task-timer-button.tsx`, `tasks-page.tsx` (`onStop`) und `calendar-page.tsx` (`stopTimer()` beim Abhaken) verwenden `useStopTimer(<Fehlertext>)` statt `useTaskTimerStore((s) => s.stop)`. Fehlertext: neuer Schlüssel `tasksPage.timer.bookError` („Die Zeit konnte nicht gebucht werden.“ / „The time could not be booked.“) in `de.ts`/`en.ts`; `TaskTimerButton` hat `labels: Dictionary["tasksPage"]["timer"]`, nutzt also `labels.bookError`; `tasks-page.tsx` und `calendar-page.tsx` holen ihn aus `dict.tasksPage.timer`. Ein `<Toaster />` muss auf `/tasks` gerendert werden (in `tasks-page.tsx` ergänzen; der Kalender hat seit Task 2 einen).

- [ ] **Step 6: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

```bash
npx prettier --write src/lib/task-timer-store.ts src/lib/task-timer-store.test.ts src/services/time-entries src/hooks/use-stop-timer.ts src/components/tasks src/components/calendar/calendar-page.tsx src/i18n/de.ts src/i18n/en.ts
git add -A src
git commit -m "feat(web): book finished timer entries to Directus

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Zeiterfassung über Directus statt localStorage

**Files:**
- Modify: `src/lib/time-tracking/repository.ts`, `src/lib/time-tracking/repository.test.ts` (neu)
- Modify: `src/pages/time-tracking.astro`, `src/components/time-tracking/time-tracking-workspace.tsx`
- Delete: `src/dummy-data/` (alle Dateien)
- Modify: Tests, die auf `dummy-data` verweisen (`grep -rn "dummy-data\|DUMMY_" src` → auf eigene Fixtures umstellen, z. B. in `src/lib/time-tracking/calculations/test-fixtures.ts`)

**Interfaces:**
- Consumes: Routen aus Task 3, `fetchProjects`/`fetchMyTasks` (Teil 1), `canViewInternalWork`.
- Produces: `createTimeBookingRepository(userId: string): TimeBookingRepository` (gleiche Schnittstelle wie bisher, Umsetzung per `fetch`); Pflicht-Props `projects`, `tasks` an `TimeTrackingWorkspace`.

- [ ] **Step 1: Failing Test** – `src/lib/time-tracking/repository.test.ts`

```ts
import { afterEach, describe, expect, it, vi } from "vitest"

import { createTimeBookingRepository } from "@/lib/time-tracking/repository"

afterEach(() => vi.unstubAllGlobals())

const booking = { id: "e1", project: "p1", task: "t1", date: "2026-11-04", duration_minutes: 30, description: null, user: "u1" }
const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

describe("createTimeBookingRepository", () => {
  it("lädt die Buchungen der Woche", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ entries: [booking] }))
    vi.stubGlobal("fetch", fetchMock)
    const entries = await createTimeBookingRepository("u1").getEntriesForWeek(new Date(2026, 10, 2))
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/time-entries?week=2026-11-02")
    expect(entries).toEqual([booking])
  })

  it("lädt die gebuchten Aufgaben als Set", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ taskIds: ["t1", "t2"] })))
    expect(await createTimeBookingRepository("u1").getBookedTaskIds()).toEqual(new Set(["t1", "t2"]))
  })

  it("legt an und sendet nur die schreibbaren Felder", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(booking, 201))
    vi.stubGlobal("fetch", fetchMock)
    const created = await createTimeBookingRepository("u1").createEntry({
      project: "p1", task: "t1", date: "2026-11-04", duration_minutes: 30, description: null, user: "u1",
    })
    expect(created).toEqual(booking)
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/time-entries")
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({ task: "t1", date: "2026-11-04", duration_minutes: 30, description: null })
  })

  it("ändert und löscht über die Id", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(ok(booking)).mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    const repository = createTimeBookingRepository("u1")
    await repository.updateEntry("e1", { description: "x", project: "p1", user: "u1" })
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/time-entries/e1")
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({ description: "x" })
    await repository.deleteEntry("e1")
    expect(fetchMock.mock.calls[1]![1].method).toBe("DELETE")
  })

  it("wirft bei Fehlerantworten", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 403 })))
    await expect(createTimeBookingRepository("u1").deleteEntry("e1")).rejects.toThrow()
  })
})
```

Run: `npx vitest run src/lib/time-tracking/repository.test.ts` → FAIL (alte localStorage-Implementierung)

- [ ] **Step 2: Repository ersetzen** – `src/lib/time-tracking/repository.ts` komplett ersetzen:

```ts
import { toDayKey } from "@/lib/week"
import type { TimeBooking, TimeBookingInput } from "@/models/time-booking"

// Datenzugriff der Zeiterfassung über die API (`/api/time-entries`); die Directus-Rechte begrenzen auf eigene Einträge.

export type TimeBookingRepository = {
  /** Buchungen von Montag bis Sonntag der Woche ab `weekStart`. */
  getEntriesForWeek: (weekStart: Date) => Promise<TimeBooking[]>
  /** IDs aller Aufgaben mit mindestens einer Buchung – Grundlage für „In Bearbeitung“. */
  getBookedTaskIds: () => Promise<Set<string>>
  createEntry: (input: TimeBookingInput) => Promise<TimeBooking>
  updateEntry: (id: string, changes: Partial<TimeBookingInput>) => Promise<TimeBooking>
  deleteEntry: (id: string) => Promise<void>
}

const BASE = "/api/time-entries"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`Zeiterfassung: ${init?.method ?? "GET"} ${url} → ${response.status}`)
  return (response.status === 204 ? undefined : await response.json()) as T
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

/** Nur diese Felder schreibt der Server; `project` und `user` ergeben sich aus Aufgabe und Session. */
function toWriteBody(input: Partial<TimeBookingInput>) {
  const { task, date, duration_minutes, description } = input
  return Object.fromEntries(
    Object.entries({ task, date, duration_minutes, description }).filter(([, value]) => value !== undefined)
  )
}

/** Repository für die Buchungen der angemeldeten Person (`userId` bleibt für die Schnittstelle erhalten). */
export function createTimeBookingRepository(_userId: string): TimeBookingRepository {
  return {
    async getEntriesForWeek(weekStart) {
      const { entries } = await request<{ entries: TimeBooking[] }>(`${BASE}?week=${toDayKey(weekStart)}`)
      return entries
    },
    async getBookedTaskIds() {
      const { taskIds } = await request<{ taskIds: string[] }>(`${BASE}/booked-tasks`)
      return new Set(taskIds)
    },
    createEntry: (input) => request<TimeBooking>(BASE, jsonInit("POST", toWriteBody(input))),
    updateEntry: (id, changes) =>
      request<TimeBooking>(`${BASE}/${encodeURIComponent(id)}`, jsonInit("PATCH", toWriteBody(changes))),
    async deleteEntry(id) {
      await request<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" })
    },
  }
}
```

Run: `npx vitest run src/lib/time-tracking/repository.test.ts` → PASS (5 Tests)

- [ ] **Step 3: Seite und Komponente**

`src/pages/time-tracking.astro`: Frontmatter ergänzen: Session prüfen (`getRequestSession`, sonst `/login`), bei `!canViewInternalWork(user.role)` `Astro.redirect("/")`, dann `const [projects, tasks] = await Promise.all([fetchProjects(token), fetchMyTasks(token)])` (Importe wie in `calendar.astro`) und `<TimeTrackingWorkspace … projects={projects} tasks={tasks} />`.

`time-tracking-workspace.tsx`: Imports von `DUMMY_PROJECTS`/`DUMMY_TRACKED_TASKS` und den Kommentar „Daten kommen per Props (Default: Dummy-Daten) …“ entfernen (durch eine Zeile ersetzen, dass Projekte/Aufgaben per Props kommen und Buchungen über das Repository laufen); Props `projects: Project[]`, `tasks: TrackedTask[]` werden Pflicht.

- [ ] **Step 4: Dummy-Daten löschen** – `git rm -r src/dummy-data`; `grep -rn "dummy-data\|DUMMY_" src` darf danach keine Treffer liefern; Tests, die `DUMMY_*` importierten, auf eigene Fixtures umstellen (Werte aus den bisherigen Dateien übernehmen, damit die Assertions unverändert bleiben).

- [ ] **Step 5: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe; `grep -rn "dummy-data\|DUMMY_" src` → keine Treffer

```bash
npx prettier --write src/lib/time-tracking src/pages/time-tracking.astro src/components/time-tracking/time-tracking-workspace.tsx
git add -A src
git commit -m "feat(web): load and save time tracking bookings through Directus

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Testdaten verteilen, Rechte, Live-Prüfung

**Files:** im Seed-Branch `feat/directus-printing-seed` (eigener Git-Worktree): `scripts/seed_directus.py`, `scripts/seed_extras.py` (neuer Modus `--assign-tasks`); keine Änderungen an diesem Branch.

- [ ] **Step 1: Directus-Rechte setzen (macht der Nutzer)** – Liste siehe Spec („Directus-Rechte“); danach bestätigen.

- [ ] **Step 2: Seed-Modus `--assign-tasks`** im Worktree (`git worktree add ../pm-seed feat/directus-printing-seed`): Funktion `assign_tasks(dx, args)` in `scripts/seed_extras.py`, die Admin und die beiden Agentur-Logins (Rolle „Agentur Mitarbeiter“) reihum auf alle Aufgaben (`tasks.assigned_to`) verteilt und die vorhandenen `time_entries` (`user_created`) der Besitzerin der Aufgabe zuordnet. Dry-Run zuerst, Lauf erst nach Bestätigung des Nutzers. Self-Test für die Verteilung (reihum, gleiche Anzahl ±1).

- [ ] **Step 3: Live-Prüfung über die App** mit den Agentur-Logins (Passwort aus dem Chat, nie in Dateien):
  - `/tasks`: Aufgaben sichtbar; Timer starten und stoppen → Eintrag erscheint in Directus (`time_entries`, mind. 1 Minute).
  - `/`: Aufgabe abhaken → `tasks.completed`/`completed_at` in Directus; Neuladen zeigt sie erledigt; wieder öffnen.
  - `/calendar`: abhaken und wieder öffnen.
  - `/time-tracking`: Woche zeigt Buchungen; anlegen, ändern, löschen, „Rückgängig“ → jeweils Directus-Stand prüfen; die Aufgabe einer anderen Person lässt sich nicht abhaken (Fehler-Toast).
  - Kunden-Login: `/time-tracking` leitet um.
- [ ] **Step 4: Ergebnis melden** (kein Commit)
