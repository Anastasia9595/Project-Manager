# Frontend liest echte Daten aus Directus (Teil 1) – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dashboard, Projekte, Aufgaben und Kalender zeigen Directus-Daten statt Dummy-Daten, über eine eigene Service-Schicht in `src/services/`.

**Architecture:** `services/directus/client.ts` baut die Verbindung mit dem Token der angemeldeten Person. Je Bereich (`customer-contacts`, `projects`, `tasks`, `work-time`, dazu das gemeinsame `time-entries`) gibt es `*.types.ts` (Directus-Zeilen), `*.mapper.ts` (reine Abbildung auf `src/models/`, getestet) und `*.repository.ts` (Laden über das Directus SDK). Astro-Seiten laden serverseitig und geben die Modelle als Props an die React-Komponenten; die `DUMMY_*`-Standardwerte der Props entfallen.

**Tech Stack:** Astro 7 + React 19, TypeScript (strict), `@directus/sdk` 25, Vitest 3.

**Spec:** `docs/superpowers/specs/2026-11-05-directus-read-data-design.md`

## Global Constraints

- Alle Befehle aus `apps/web` ausführen (`cd apps/web`), sofern nicht anders angegeben.
- Tests: `npm test` (= `vitest run`, Zeitzone in `vitest.config.ts` fest auf `Europe/Berlin`). Testdateien liegen neben dem Code als `*.test.ts`.
- Typecheck: `npx astro check` → `0 errors`. Lint: `npx eslint src` → keine Ausgabe.
- Prettier **nur auf geänderte/neue Dateien** anwenden (`npx prettier --write <dateien>`), nie auf ganze Ordner.
- Code-Kommentare und Testnamen auf Deutsch; Kommentare nur für das Warum.
- Importe mit Alias `@/…`.
- Status-Abbildung: `created` → `created`, `in progress` → `active`, `completed`/`invoiced` → `completed`; `cancelled` wird nirgends angezeigt (weder Druckstrecke noch deren Tasks).
- Directus-Zugriff nur mit `createUserClient(accessToken)` (Token der angemeldeten Person), nie mit statischem Token.
- `/time-tracking` und `components/time-tracking/*` bleiben unverändert auf Dummy-Daten (Teil 3).
- Commit-Messages enden mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

### Task 1: Service-Grundlage und Umzug der Kundenkontakte

**Files:**
- Move: `src/lib/auth/user-client.ts` → `src/services/directus/client.ts`
- Modify: `src/lib/profile.ts`, `src/lib/customer-contact-form/repository.ts` (Import von `createUserClient`)
- Create: `src/services/customer-contacts/customer-contacts.types.ts`, `customer-contacts.mapper.ts`, `customer-contacts.repository.ts`
- Move+Modify: `src/lib/customer-contacts-repository.test.ts` → `src/services/customer-contacts/customer-contacts.mapper.test.ts`
- Delete: `src/lib/customer-contacts-repository.ts`, `src/lib/directus.ts`
- Modify: `src/pages/index.astro`, `src/pages/company-profile/index.astro`, `src/pages/company-profile/[id].astro` (Import-Pfad)

**Interfaces:**
- Produces: `createUserClient(accessToken: string)` aus `@/services/directus/client`; `toCustomerContact(row: TenantRow, positionLabels?: Record<string, string>): CustomerContact` aus `@/services/customer-contacts/customer-contacts.mapper`; `fetchCustomerContacts(accessToken: string): Promise<CustomerContact[]>` und `fetchCustomerContact(accessToken: string, id: string, positionLabels?: Record<string, string>): Promise<CustomerContact>` aus `@/services/customer-contacts/customer-contacts.repository`.

Reiner Umzug ohne Verhaltensänderung; die bestehenden Tests sind der Nachweis.

- [ ] **Step 1: Client verschieben**

```bash
mkdir -p src/services/directus src/services/customer-contacts
git mv src/lib/auth/user-client.ts src/services/directus/client.ts
```

In `src/lib/profile.ts` und `src/lib/customer-contact-form/repository.ts` jeweils
`import { createUserClient } from "@/lib/auth/user-client"` ersetzen durch
`import { createUserClient } from "@/services/directus/client"`.

- [ ] **Step 2: Typen anlegen** – `src/services/customer-contacts/customer-contacts.types.ts`

```ts
/** Zeilen aus Directus, nur die geladenen Felder. */
export type LocationRow = {
  id: string
  name: string | null
  is_primary: boolean | null
  street: string | null
  postal_code: number | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
}

export type UserRow = {
  id: string
  first_name: string | null
  last_name: string | null
  positions: string | null
  email: string | null
  phone: string | null
}

export type TenantRow = {
  id: string
  tenant_name: string | null
  logo: string | null
  main_email: string | null
  main_phone: string | null
  notes: string | null
  date_created: string | null
  distributor: { name: string | null } | null
  locations: LocationRow[] | null
  tenant_users: UserRow[] | null
}
```

- [ ] **Step 3: Mapper anlegen** – `src/services/customer-contacts/customer-contacts.mapper.ts`

```ts
import { getProfileAvatarUrl } from "@/lib/profile-fields"
import type { CustomerContact } from "@/models/customer-contact"
import { getFullName } from "@/utils/full-name"

import type { LocationRow, TenantRow } from "./customer-contacts.types"

const POSITION_PRIORITY = [
  "management",
  "werbeabteilung",
  "assistenz_von_fr_seifert",
  "assistenz_empfang",
]

function positionRank(position: string | null): number {
  const index = POSITION_PRIORITY.indexOf(position ?? "")
  return index === -1 ? POSITION_PRIORITY.length : index
}

function formatAddress(location?: LocationRow): string {
  if (!location) return ""
  const town = [location.postal_code, location.city].filter(Boolean).join(" ")
  return [location.street, town].filter(Boolean).join(", ")
}

/** Bildet einen Directus-Tenant auf die Felder ab, die Tabelle und Detailseite erwarten. */
export function toCustomerContact(
  row: TenantRow,
  positionLabels: Record<string, string> = {}
): CustomerContact {
  const locations = row.locations ?? []
  const users = [...(row.tenant_users ?? [])].sort(
    (a, b) => positionRank(a.positions) - positionRank(b.positions)
  )
  const main = locations.find((location) => location.is_primary) ?? locations[0]

  return {
    id: row.id,
    customer: row.tenant_name ?? "",
    // Der Avatar-Proxy liefert jede Directus-Datei mit dem Token der angemeldeten Person aus.
    logoUrl: row.logo ? getProfileAvatarUrl(row.logo) : undefined,
    contactPerson: getFullName(users[0]?.first_name, users[0]?.last_name),
    website: main?.website ?? "",
    email: row.main_email ?? "",
    phone: row.main_phone ?? "",
    address: formatAddress(main),
    association: row.distributor?.name ?? "",
    createdAt: row.date_created?.slice(0, 10),
    note: row.notes ?? undefined,
    contacts: users.map((user) => ({
      id: user.id,
      name: getFullName(user.first_name, user.last_name),
      position: positionLabels[user.positions ?? ""] ?? user.positions ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
    })),
    branches: locations.map((location) => ({
      id: location.id,
      name: location.name ?? "",
      address: formatAddress(location),
      phone: location.phone ?? "",
      email: location.email ?? "",
    })),
  }
}
```

- [ ] **Step 4: Repository anlegen** – `src/services/customer-contacts/customer-contacts.repository.ts`

```ts
import { readItem, readItems } from "@directus/sdk"

import type { CustomerContact } from "@/models/customer-contact"
import { createUserClient } from "@/services/directus/client"

import { toCustomerContact } from "./customer-contacts.mapper"
import type { TenantRow } from "./customer-contacts.types"

const FIELDS = [
  "id",
  "tenant_name",
  "logo",
  "main_email",
  "main_phone",
  "notes",
  "date_created",
  "distributor.name",
  "locations.id",
  "locations.name",
  "locations.is_primary",
  "locations.street",
  "locations.postal_code",
  "locations.city",
  "locations.phone",
  "locations.email",
  "locations.website",
  "tenant_users.id",
  "tenant_users.first_name",
  "tenant_users.last_name",
  "tenant_users.positions",
  "tenant_users.email",
  "tenant_users.phone",
]

// Zugriffe laufen mit dem Token der angemeldeten Person, damit ihre Directus-Rolle
// bestimmt, welche Kunden sie sehen.

export async function fetchCustomerContacts(
  accessToken: string
): Promise<CustomerContact[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("tenants", { fields: FIELDS, sort: ["tenant_name"], limit: -1 })
  )) as unknown as TenantRow[]
  return rows.map((row) => toCustomerContact(row))
}

export async function fetchCustomerContact(
  accessToken: string,
  id: string,
  positionLabels?: Record<string, string>
): Promise<CustomerContact> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    readItem("tenants", id, { fields: FIELDS })
  )) as unknown as TenantRow
  return toCustomerContact(row, positionLabels)
}
```

- [ ] **Step 5: Test umziehen**

```bash
git mv src/lib/customer-contacts-repository.test.ts src/services/customer-contacts/customer-contacts.mapper.test.ts
```

Kopf der verschobenen Datei (bis einschließlich des `await import(...)`-Blocks) ersetzen durch:

```ts
import { describe, expect, it } from "vitest"

import { toCustomerContact } from "@/services/customer-contacts/customer-contacts.mapper"
```

Der Rest der Datei bleibt unverändert (der Mapper importiert keinen Client mehr, daher entfällt `vi.mock`).

- [ ] **Step 6: Alte Dateien löschen und Seiten umstellen**

```bash
git rm src/lib/customer-contacts-repository.ts src/lib/directus.ts
```

In `src/pages/index.astro`, `src/pages/company-profile/index.astro` und `src/pages/company-profile/[id].astro`
`from "@/lib/customer-contacts-repository"` ersetzen durch `from "@/services/customer-contacts/customer-contacts.repository"`.

- [ ] **Step 7: Prüfen**

Run: `grep -rn "lib/auth/user-client\|customer-contacts-repository\|@/lib/directus\"" src` → keine Treffer
Run: `npm test` → alle Tests grün (inkl. `customer-contacts.mapper.test.ts`, 3 Tests)
Run: `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

- [ ] **Step 8: Commit**

```bash
npx prettier --write src/services src/lib/profile.ts src/lib/customer-contact-form/repository.ts
git add -A src
git commit -m "refactor(web): move Directus client and customer contacts into services layer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Projekte-Service (`printing_lines` → `Project`)

**Files:**
- Create: `src/services/projects/projects.types.ts`, `projects.mapper.ts`, `projects.mapper.test.ts`, `projects.repository.ts`

**Interfaces:**
- Consumes: `createUserClient` (Task 1), `addDays`, `parseDayKey` aus `@/lib/week`, `Project`/`ProjectStatus` aus `@/models/project`.
- Produces: `type PrintingLineStatus`, `type PrintingLineRow`; `toProject(row: PrintingLineRow): Project | null`, `toProjects(rows: PrintingLineRow[]): Project[]`; `fetchProjects(accessToken: string): Promise<Project[]>`.

- [ ] **Step 1: Typen** – `src/services/projects/projects.types.ts`

```ts
export type PrintingLineStatus = "created" | "in progress" | "completed" | "invoiced" | "cancelled"

/** Zeile aus `printing_lines`, nur die geladenen Felder. */
export type PrintingLineRow = {
  id: string
  name: string | null
  status: PrintingLineStatus | null
  pal_date: string | null
  buffer_days: number | null
  circulation: number | null
  tenant: { tenant_name: string | null } | null
  tasks: { completed: boolean | null }[] | null
}
```

- [ ] **Step 2: Failing Test** – `src/services/projects/projects.mapper.test.ts`

```ts
import { describe, expect, it } from "vitest"

import { toProject, toProjects } from "@/services/projects/projects.mapper"
import type { PrintingLineRow } from "@/services/projects/projects.types"

const row: PrintingLineRow = {
  id: "p1",
  name: "Weber_4526_Flyer_Jubilaeum",
  status: "in progress",
  pal_date: "2026-11-20",
  buffer_days: 2,
  circulation: 30000,
  tenant: { tenant_name: "Weber Medien GmbH" },
  tasks: [{ completed: true }, { completed: false }, { completed: null }],
}

describe("toProject", () => {
  it("bildet eine Druckstrecke auf ein Projekt ab", () => {
    expect(toProject(row)).toEqual({
      id: "p1",
      name: "Weber_4526_Flyer_Jubilaeum",
      status: "active",
      palDate: new Date(2026, 10, 20),
      dataHandoverDate: new Date(2026, 10, 18),
      customer: "Weber Medien GmbH",
      progress: { done: 1, total: 3 },
      circulation: 30000,
    })
  })

  it.each([
    ["created", "created"],
    ["in progress", "active"],
    ["completed", "completed"],
    ["invoiced", "completed"],
  ] as const)("übersetzt den Status %s in %s", (status, expected) => {
    expect(toProject({ ...row, status })?.status).toBe(expected)
  })

  it("blendet stornierte Druckstrecken aus", () => {
    expect(toProject({ ...row, status: "cancelled" })).toBeNull()
    expect(toProjects([row, { ...row, id: "p2", status: "cancelled" }]).map((p) => p.id)).toEqual(["p1"])
  })

  it("setzt fehlende Werte auf neutrale Standardwerte", () => {
    expect(
      toProject({ ...row, name: null, buffer_days: null, circulation: null, tenant: null, tasks: null })
    ).toMatchObject({
      name: "",
      dataHandoverDate: new Date(2026, 10, 20),
      customer: "",
      progress: { done: 0, total: 0 },
      circulation: 0,
    })
  })
})
```

Run: `npx vitest run src/services/projects` → FAIL (`Failed to resolve import "@/services/projects/projects.mapper"`)

- [ ] **Step 3: Mapper** – `src/services/projects/projects.mapper.ts`

```ts
import { addDays, parseDayKey } from "@/lib/week"
import type { Project, ProjectStatus } from "@/models/project"

import type { PrintingLineRow, PrintingLineStatus } from "./projects.types"

const STATUS: Record<Exclude<PrintingLineStatus, "cancelled">, ProjectStatus> = {
  created: "created",
  "in progress": "active",
  completed: "completed",
  invoiced: "completed",
}

/** Bildet eine Druckstrecke auf ein Projekt ab; stornierte (oder ohne PAL) liefern `null`. */
export function toProject(row: PrintingLineRow): Project | null {
  if (row.status === "cancelled" || !row.pal_date) return null
  const tasks = row.tasks ?? []
  const palDate = parseDayKey(row.pal_date)
  return {
    id: row.id,
    name: row.name ?? "",
    status: STATUS[row.status ?? "created"],
    palDate,
    dataHandoverDate: addDays(palDate, -(row.buffer_days ?? 0)),
    customer: row.tenant?.tenant_name ?? "",
    progress: { done: tasks.filter((task) => task.completed).length, total: tasks.length },
    circulation: row.circulation ?? 0,
  }
}

export function toProjects(rows: PrintingLineRow[]): Project[] {
  return rows.flatMap((row) => toProject(row) ?? [])
}
```

Run: `npx vitest run src/services/projects` → PASS (7 Tests)

- [ ] **Step 4: Repository** – `src/services/projects/projects.repository.ts`

```ts
import { readItems } from "@directus/sdk"

import type { Project } from "@/models/project"
import { createUserClient } from "@/services/directus/client"

import { toProjects } from "./projects.mapper"
import type { PrintingLineRow } from "./projects.types"

const FIELDS = [
  "id",
  "name",
  "status",
  "pal_date",
  "buffer_days",
  "circulation",
  "tenant.tenant_name",
  "tasks.completed",
]

/** Nicht stornierte Druckstrecken, die die Rolle der angemeldeten Person sehen darf, nach PAL sortiert. */
export async function fetchProjects(accessToken: string): Promise<Project[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("printing_lines", {
      fields: FIELDS,
      filter: { status: { _neq: "cancelled" } },
      sort: ["pal_date"],
      limit: -1,
    })
  )) as unknown as PrintingLineRow[]
  return toProjects(rows)
}
```

- [ ] **Step 5: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

```bash
npx prettier --write src/services/projects
git add src/services/projects
git commit -m "feat(web): add projects service mapping printing_lines to projects

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Aufgaben-Service (`tasks` + `time_entries` → `TrackedTask`)

**Files:**
- Create: `src/services/time-entries/time-entries.types.ts`, `time-entries.mapper.ts`
- Create: `src/services/tasks/tasks.types.ts`, `tasks.mapper.ts`, `tasks.mapper.test.ts`, `tasks.repository.ts`

**Interfaces:**
- Consumes: `createUserClient` (Task 1), `PrintingLineStatus` (Task 2), `MINUTES_PER_HOUR` aus `@/lib/time-tracking/calculations/duration`, `parseDayKey` aus `@/lib/week`, `TrackedTask`/`TimeEntry` aus `@/models/task`.
- Produces: `type TimeEntryRow`, `toEntryMinutes(row: Pick<TimeEntryRow, "hours" | "minutes">): number`; `type TaskItemRow`, `toTrackedTask(row: TaskItemRow): TrackedTask | null`, `toTrackedTasks(rows: TaskItemRow[]): TrackedTask[]`; `fetchMyTasks(accessToken: string): Promise<TrackedTask[]>`.

- [ ] **Step 1: Zeiteintrag-Typ und -Dauer**

`src/services/time-entries/time-entries.types.ts`:

```ts
/** Zeile aus `time_entries`, nur die geladenen Felder (`work_date` als "YYYY-MM-DD"). */
export type TimeEntryRow = {
  work_date: string
  hours: number | null
  minutes: number | null
}
```

`src/services/time-entries/time-entries.mapper.ts`:

```ts
import { MINUTES_PER_HOUR } from "@/lib/time-tracking/calculations/duration"

import type { TimeEntryRow } from "./time-entries.types"

/** Dauer eines Directus-Zeiteintrags in Minuten (`hours` + `minutes`). */
export function toEntryMinutes(row: Pick<TimeEntryRow, "hours" | "minutes">): number {
  return (row.hours ?? 0) * MINUTES_PER_HOUR + (row.minutes ?? 0)
}
```

- [ ] **Step 2: Aufgaben-Typen** – `src/services/tasks/tasks.types.ts`

```ts
import type { TaskPriority } from "@/models/task"
import type { PrintingLineStatus } from "@/services/projects/projects.types"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

/** Zeile aus `tasks`, nur die geladenen Felder. */
export type TaskItemRow = {
  id: string
  task_name: string | null
  priority: TaskPriority | null
  due_date: string | null
  completed: boolean | null
  completed_at: string | null
  printing_lines: {
    id: string
    name: string | null
    status: PrintingLineStatus | null
    tenant: { tenant_name: string | null } | null
  } | null
  time_entries: TimeEntryRow[] | null
}
```

- [ ] **Step 3: Failing Test** – `src/services/tasks/tasks.mapper.test.ts`

```ts
import { describe, expect, it } from "vitest"

import { toTrackedTask, toTrackedTasks } from "@/services/tasks/tasks.mapper"
import type { TaskItemRow } from "@/services/tasks/tasks.types"

const row: TaskItemRow = {
  id: "t1",
  task_name: "Briefing",
  priority: "high",
  due_date: "2026-11-05",
  completed: true,
  completed_at: "2026-11-03T10:30:00.000Z",
  printing_lines: {
    id: "p1",
    name: "Weber_4526_Flyer_Jubilaeum",
    status: "in progress",
    tenant: { tenant_name: "Weber Medien GmbH" },
  },
  time_entries: [
    { work_date: "2026-11-02", hours: 1, minutes: 30 },
    { work_date: "2026-11-04", hours: null, minutes: 45 },
  ],
}

describe("toTrackedTask", () => {
  it("bildet eine Directus-Aufgabe mit Zeiteinträgen ab", () => {
    expect(toTrackedTask(row)).toEqual({
      id: "t1",
      title: "Briefing",
      projectId: "p1",
      projectName: "Weber_4526_Flyer_Jubilaeum",
      customer: "Weber Medien GmbH",
      priority: "high",
      dueDate: new Date(2026, 10, 5),
      done: true,
      completedAt: new Date("2026-11-03T10:30:00.000Z"),
      timeEntries: [
        { taskId: "t1", startedAt: new Date(2026, 10, 2, 8), seconds: 5400 },
        { taskId: "t1", startedAt: new Date(2026, 10, 4, 8), seconds: 2700 },
      ],
    })
  })

  it("überspringt Aufgaben stornierter Druckstrecken und ohne Fälligkeit", () => {
    const cancelled = { ...row, id: "t2", printing_lines: { ...row.printing_lines!, status: "cancelled" as const } }
    expect(toTrackedTask(cancelled)).toBeNull()
    expect(toTrackedTask({ ...row, due_date: null })).toBeNull()
    expect(toTrackedTasks([row, cancelled]).map((task) => task.id)).toEqual(["t1"])
  })

  it("setzt fehlende Werte auf neutrale Standardwerte", () => {
    expect(
      toTrackedTask({
        ...row,
        task_name: null,
        priority: null,
        completed: null,
        completed_at: null,
        printing_lines: null,
        time_entries: null,
      })
    ).toMatchObject({
      title: "",
      projectId: "",
      projectName: "",
      customer: "",
      priority: "medium",
      done: false,
      completedAt: undefined,
      timeEntries: [],
    })
  })
})
```

Run: `npx vitest run src/services/tasks` → FAIL (`Failed to resolve import "@/services/tasks/tasks.mapper"`)

- [ ] **Step 4: Mapper** – `src/services/tasks/tasks.mapper.ts`

```ts
import { parseDayKey } from "@/lib/week"
import type { TimeEntry, TrackedTask } from "@/models/task"
import { toEntryMinutes } from "@/services/time-entries/time-entries.mapper"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

import type { TaskItemRow } from "./tasks.types"

const SECONDS_PER_MINUTE = 60
// Directus speichert nur den Tag; 08:00 Uhr ordnet den Eintrag sicher diesem Tag zu.
const WORKDAY_START_HOUR = 8

function toTimeEntry(taskId: string, row: TimeEntryRow): TimeEntry {
  const startedAt = parseDayKey(row.work_date)
  startedAt.setHours(WORKDAY_START_HOUR)
  return { taskId, startedAt, seconds: toEntryMinutes(row) * SECONDS_PER_MINUTE }
}

/** Bildet eine Directus-Aufgabe ab; ohne Fälligkeit oder bei stornierter Druckstrecke `null`. */
export function toTrackedTask(row: TaskItemRow): TrackedTask | null {
  const line = row.printing_lines
  if (!row.due_date || line?.status === "cancelled") return null
  return {
    id: row.id,
    title: row.task_name ?? "",
    projectId: line?.id ?? "",
    projectName: line?.name ?? "",
    customer: line?.tenant?.tenant_name ?? "",
    priority: row.priority ?? "medium",
    dueDate: parseDayKey(row.due_date),
    done: row.completed ?? false,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    timeEntries: (row.time_entries ?? []).map((entry) => toTimeEntry(row.id, entry)),
  }
}

export function toTrackedTasks(rows: TaskItemRow[]): TrackedTask[] {
  return rows.flatMap((row) => toTrackedTask(row) ?? [])
}
```

Run: `npx vitest run src/services/tasks` → PASS (3 Tests)

- [ ] **Step 5: Repository** – `src/services/tasks/tasks.repository.ts`

```ts
import { readItems } from "@directus/sdk"

import type { TrackedTask } from "@/models/task"
import { createUserClient } from "@/services/directus/client"

import { toTrackedTasks } from "./tasks.mapper"
import type { TaskItemRow } from "./tasks.types"

const FIELDS = [
  "id",
  "task_name",
  "priority",
  "due_date",
  "completed",
  "completed_at",
  "printing_lines.id",
  "printing_lines.name",
  "printing_lines.status",
  "printing_lines.tenant.tenant_name",
  "time_entries.work_date",
  "time_entries.hours",
  "time_entries.minutes",
]

/** Aufgaben der angemeldeten Person ohne stornierte Druckstrecken, nach Fälligkeit sortiert. */
export async function fetchMyTasks(accessToken: string): Promise<TrackedTask[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("tasks", {
      fields: FIELDS,
      filter: {
        assigned_to: { _eq: "$CURRENT_USER" },
        printing_lines: { status: { _neq: "cancelled" } },
      },
      sort: ["due_date"],
      limit: -1,
    })
  )) as unknown as TaskItemRow[]
  return toTrackedTasks(rows)
}
```

- [ ] **Step 6: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

```bash
npx prettier --write src/services/tasks src/services/time-entries
git add src/services/tasks src/services/time-entries
git commit -m "feat(web): add tasks service with time entries from Directus

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Arbeitszeit-Service und Kennzahlen-Ableitung

**Files:**
- Create: `src/services/work-time/work-time.mapper.ts`, `work-time.mapper.test.ts`, `work-time.repository.ts`
- Create: `src/lib/project-stats.ts`, `src/lib/project-stats.test.ts`

**Interfaces:**
- Consumes: `TimeEntryRow`, `toEntryMinutes` (Task 3), `createUserClient` (Task 1), `defaultDailyTarget`/`DailyTarget` aus `@/lib/time-tracking/calculations/daily-target`, `getWorkweekDays`, `startOfWeek`, `toDayKey` aus `@/lib/week`.
- Produces: `toWorkWeek(rows: TimeEntryRow[], weekStart: Date, dailyTarget?: DailyTarget): WorkDay[]`; `fetchWorkWeek(accessToken: string, today?: Date): Promise<WorkDay[]>`; `getProjectStats(projects: Project[], today: Date): Omit<ProjectStat, "unit">[]`.

- [ ] **Step 1: Failing Tests**

`src/services/work-time/work-time.mapper.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { toWorkWeek } from "@/services/work-time/work-time.mapper"

const monday = new Date(2026, 10, 2)

describe("toWorkWeek", () => {
  it("summiert die Stunden je Arbeitstag und setzt das Soll", () => {
    const days = toWorkWeek(
      [
        { work_date: "2026-11-02", hours: 1, minutes: 30 },
        { work_date: "2026-11-02", hours: 2, minutes: 0 },
        { work_date: "2026-11-04", hours: 4, minutes: null },
        { work_date: "2026-11-08", hours: 3, minutes: 0 },
      ],
      monday
    )
    expect(days.map((day) => day.label)).toEqual(["MON", "DIE", "MIT", "DON", "FRE"])
    expect(days.map((day) => day.name)).toEqual(["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"])
    expect(days.map((day) => day.actualHours)).toEqual([3.5, 0, 4, 0, 0])
    expect(days.map((day) => day.targetHours)).toEqual([8, 8, 8, 8, 8])
  })

  it("nimmt ein abweichendes Tages-Soll", () => {
    const days = toWorkWeek([], monday, () => 240)
    expect(days.map((day) => day.targetHours)).toEqual([4, 4, 4, 4, 4])
  })
})
```

`src/lib/project-stats.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { getProjectStats } from "@/lib/project-stats"
import type { Project } from "@/models/project"

const project = (id: string, palDate: Date, status: Project["status"] = "active"): Project => ({
  id,
  name: id,
  status,
  palDate,
  dataHandoverDate: palDate,
  customer: "",
  progress: { done: 0, total: 0 },
  circulation: 0,
})

describe("getProjectStats", () => {
  it("zählt offene Projekte nach PAL-Datum (heute = Donnerstag)", () => {
    const today = new Date(2026, 10, 5, 15, 30)
    const stats = getProjectStats(
      [
        project("überfällig", new Date(2026, 10, 1)),
        project("heute", new Date(2026, 10, 5)),
        project("sonntag", new Date(2026, 10, 8)),
        project("freitag", new Date(2026, 10, 6)),
        project("nächste-woche", new Date(2026, 10, 9)),
        project("erledigt", new Date(2026, 10, 3), "completed"),
      ],
      today
    )
    expect(stats.map((stat) => [stat.label, stat.value, stat.tone])).toEqual([
      ["Überfällig", 1, "error"],
      ["Heute fällig", 1, "warning"],
      ["Diese Woche", 2, "success"],
      ["Anstehend", 1, "neutral"],
    ])
  })
})
```

Run: `npx vitest run src/services/work-time src/lib/project-stats.test.ts` → FAIL (Importe nicht auflösbar)

- [ ] **Step 2: Arbeitszeit-Mapper** – `src/services/work-time/work-time.mapper.ts`

```ts
import { MINUTES_PER_HOUR } from "@/lib/time-tracking/calculations/duration"
import { defaultDailyTarget, type DailyTarget } from "@/lib/time-tracking/calculations/daily-target"
import { getWorkweekDays, toDayKey } from "@/lib/week"
import type { WorkDay } from "@/models/work-day"
import { toEntryMinutes } from "@/services/time-entries/time-entries.mapper"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

const DAY_LABELS = [
  ["MON", "Montag"],
  ["DIE", "Dienstag"],
  ["MIT", "Mittwoch"],
  ["DON", "Donnerstag"],
  ["FRE", "Freitag"],
] as const

/** Ist- und Soll-Stunden je Arbeitstag (Mo–Fr) der Woche ab `weekStart`; andere Tage werden ignoriert. */
export function toWorkWeek(
  rows: TimeEntryRow[],
  weekStart: Date,
  dailyTarget: DailyTarget = defaultDailyTarget
): WorkDay[] {
  const minutesByDay = new Map<string, number>()
  for (const row of rows) {
    minutesByDay.set(row.work_date, (minutesByDay.get(row.work_date) ?? 0) + toEntryMinutes(row))
  }
  return getWorkweekDays(weekStart).map((day, index) => ({
    label: DAY_LABELS[index]![0],
    name: DAY_LABELS[index]![1],
    targetHours: dailyTarget(day) / MINUTES_PER_HOUR,
    actualHours: (minutesByDay.get(toDayKey(day)) ?? 0) / MINUTES_PER_HOUR,
  }))
}
```

- [ ] **Step 3: Kennzahlen** – `src/lib/project-stats.ts`

```ts
import {
  Calendar01FreeIcons,
  ChartBarLineIcon,
  Clock01Icon,
  TriangleAlertIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { addDays, startOfWeek, toDayKey } from "@/lib/week"
import type { Project } from "@/models/project"
import type { ProjectStat } from "@/models/project-stat"

/** Kennzahlen des Dashboards: offene Projekte nach PAL-Datum relativ zu `today`. */
export function getProjectStats(projects: Project[], today: Date): Omit<ProjectStat, "unit">[] {
  // Tages-Schlüssel ("YYYY-MM-DD") vergleichen sich wie Daten, ohne Uhrzeit
  const todayKey = toDayKey(today)
  const weekEndKey = toDayKey(addDays(startOfWeek(today), 6))
  const palKeys = projects
    .filter((project) => project.status !== "completed")
    .map((project) => toDayKey(project.palDate))
  const count = (match: (key: string) => boolean) => palKeys.filter(match).length

  return [
    { label: "Überfällig", value: count((key) => key < todayKey), icon: TriangleAlertIcon as IconSvgElement, tone: "error" },
    { label: "Heute fällig", value: count((key) => key === todayKey), icon: Clock01Icon as IconSvgElement, tone: "warning" },
    {
      label: "Diese Woche",
      value: count((key) => key > todayKey && key <= weekEndKey),
      icon: Calendar01FreeIcons as IconSvgElement,
      tone: "success",
    },
    { label: "Anstehend", value: count((key) => key > weekEndKey), icon: ChartBarLineIcon as IconSvgElement, tone: "neutral" },
  ]
}
```

Run: `npx vitest run src/services/work-time src/lib/project-stats.test.ts` → PASS (3 Tests)

- [ ] **Step 4: Arbeitszeit-Repository** – `src/services/work-time/work-time.repository.ts`

```ts
import { readItems } from "@directus/sdk"

import { getWorkweekDays, startOfWeek, toDayKey } from "@/lib/week"
import type { WorkDay } from "@/models/work-day"
import { createUserClient } from "@/services/directus/client"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

import { toWorkWeek } from "./work-time.mapper"

/** Arbeitszeit der angemeldeten Person in der Woche (Mo–Fr), in der `today` liegt. */
export async function fetchWorkWeek(accessToken: string, today: Date = new Date()): Promise<WorkDay[]> {
  const weekStart = startOfWeek(today)
  const days = getWorkweekDays(weekStart)
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("time_entries", {
      fields: ["work_date", "hours", "minutes"],
      filter: {
        user_created: { _eq: "$CURRENT_USER" },
        work_date: { _between: [toDayKey(days[0]!), toDayKey(days[days.length - 1]!)] },
      },
      limit: -1,
    })
  )) as unknown as TimeEntryRow[]
  return toWorkWeek(rows, weekStart)
}
```

- [ ] **Step 5: Prüfen und Commit**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

```bash
npx prettier --write src/services/work-time src/lib/project-stats.ts src/lib/project-stats.test.ts
git add src/services/work-time src/lib/project-stats.ts src/lib/project-stats.test.ts
git commit -m "feat(web): add work-time service and project stats derivation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Seiten und Komponenten auf Directus umstellen

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/projects.astro`, `src/pages/tasks.astro`, `src/pages/calendar.astro`
- Modify: `src/components/dashboard/project-stats/project-stats.tsx`, `src/components/dashboard/projects/projects-table.tsx`, `src/components/dashboard/my-tasks/my-tasks.tsx`, `src/components/dashboard/work-time/weekly-work-time.tsx`, `src/components/projects/projects-page.tsx`, `src/components/tasks/tasks-page.tsx`, `src/components/calendar/calendar-page.tsx`
- Delete: `src/dummy-data/tasks.ts`, `src/dummy-data/project-stats.ts`, `src/dummy-data/work-time.ts`

**Interfaces:**
- Consumes: `fetchCustomerContacts` (Task 1), `fetchProjects` (Task 2), `fetchMyTasks` (Task 3), `fetchWorkWeek`, `getProjectStats` (Task 4), `getRequestSession` aus `@/lib/auth/request-session`.
- Produces: Pflicht-Props `projects: Project[]` (ProjectStats, ProjectsTable, ProjectsPage, CalendarPage), `tasks: Task[]` (MyTasks), `tasks: TrackedTask[]` (TasksPage, CalendarPage), `days: WorkDay[]` (WeeklyWorkTime).

- [ ] **Step 1: Kennzahlen-Komponente** – `src/components/dashboard/project-stats/project-stats.tsx` ersetzen durch:

```tsx
import { getProjectStats } from "@/lib/project-stats"
import type { Project } from "@/models/project"
import { ProjectStatCard } from "./project-stat-card"

export function ProjectStats({ projects }: { projects: Project[] }) {
  const stats = getProjectStats(projects, new Date())
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-3 @5xl:grid-cols-4 @5xl:gap-4">
        {stats.map((stat) => (
          <ProjectStatCard key={stat.label} {...stat} unit="Projekte" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Dummy-Standardwerte entfernen**

- `projects-table.tsx`: Import `DUMMY_PROJECTS` entfernen; im Props-Destructuring `projects = DUMMY_PROJECTS,` → `projects,`; im Props-Typ `projects?: Project[]` → `projects: Project[]`.
- `projects-page.tsx`: Import `DUMMY_PROJECTS` entfernen; `projects = DUMMY_PROJECTS,` → `projects,`; `projects?: Project[]` → `projects: Project[]`.
- `tasks-page.tsx`: Import `DUMMY_TRACKED_TASKS` entfernen; `tasks = DUMMY_TRACKED_TASKS,` → `tasks,`; `tasks?: TrackedTask[]` → `tasks: TrackedTask[]`.
- `calendar-page.tsx`: Importe `DUMMY_PROJECTS` und `DUMMY_TRACKED_TASKS` entfernen; `tasks: initialTasks = DUMMY_TRACKED_TASKS,` → `tasks: initialTasks,`; `projects = DUMMY_PROJECTS,` → `projects,`; Typen `tasks?: TrackedTask[]` → `tasks: TrackedTask[]`, `projects?: Project[]` → `projects: Project[]`.
- `my-tasks.tsx`: Import `DUMMY_TASKS` entfernen; `tasks: initialTasks = DUMMY_TASKS,` → `tasks: initialTasks,`; im Typ `MyTasksProps` `tasks?: Task[]` → `tasks: Task[]`.
- `weekly-work-time.tsx`: Import `DUMMY_WORK_WEEK` entfernen; Signatur `({ days = DUMMY_WORK_WEEK }: { days?: WorkDay[] })` → `({ days }: { days: WorkDay[] })`.

- [ ] **Step 3: Dashboard** – in `src/pages/index.astro`:

Import `fetchCustomerContacts` (seit Task 1 aus `@/services/customer-contacts/customer-contacts.repository`) beibehalten und ergänzen:

```astro
import { fetchProjects } from "@/services/projects/projects.repository"
import { fetchMyTasks } from "@/services/tasks/tasks.repository"
import { fetchWorkWeek } from "@/services/work-time/work-time.repository"
```

Den Block nach `if (!session) return Astro.redirect("/login")` ersetzen durch:

```astro
const token = session.tokens.accessToken
const [projects, tasks, workWeek, allCustomerContacts] = await Promise.all([
  fetchProjects(token),
  fetchMyTasks(token),
  fetchWorkWeek(token),
  fetchCustomerContacts(token),
])
// Das Dashboard-Widget zeigt nur die ersten Kunden; die volle Liste steht unter /company-profile.
const customerContacts = allCustomerContacts.slice(0, 5)
```

Im Markup: `<ProjectStats client:load />` → `<ProjectStats client:load projects={projects} />`;
`<ProjectsTable client:load title={…} />` → `<ProjectsTable client:load projects={projects} title={dict.dashboard.myProjects.title} />`;
`<MyTasks client:load className="lg:absolute lg:inset-0" />` → `<MyTasks client:load tasks={tasks} className="lg:absolute lg:inset-0" />`;
`<WeeklyWorkTime />` → `<WeeklyWorkTime days={workWeek} />`.

- [ ] **Step 4: Projekte, Aufgaben, Kalender**

`src/pages/projects.astro` – Frontmatter ersetzen durch:

```astro
---
import AppLayout from "@/layouts/app.astro"
import { getDictionary } from "@/i18n"
import { ProjectsPage } from "@/components/projects/projects-page"
import { getRequestSession } from "@/lib/auth/request-session"
import { fetchProjects } from "@/services/projects/projects.repository"

const session = getRequestSession(Astro.cookies, Astro.locals)
if (!session) return Astro.redirect("/login")

const locale = Astro.currentLocale ?? "de"
const dict = getDictionary(locale)
const projects = await fetchProjects(session.tokens.accessToken)
---
```

und `<ProjectsPage client:load locale={locale} />` → `<ProjectsPage client:load locale={locale} projects={projects} />`.

`src/pages/tasks.astro` – Frontmatter ersetzen durch:

```astro
---
import AppLayout from "@/layouts/app.astro"
import { getDictionary } from "@/i18n"
import { TasksPage } from "@/components/tasks/tasks-page"
import { getRequestSession } from "@/lib/auth/request-session"
import { fetchMyTasks } from "@/services/tasks/tasks.repository"

const session = getRequestSession(Astro.cookies, Astro.locals)
if (!session) return Astro.redirect("/login")

const locale = Astro.currentLocale ?? "de"
const dict = getDictionary(locale)
const tasks = await fetchMyTasks(session.tokens.accessToken)
---
```

und `<TasksPage client:load locale={locale} />` → `<TasksPage client:load locale={locale} tasks={tasks} />`.

`src/pages/calendar.astro` – Frontmatter ersetzen durch:

```astro
---
import AppLayout from "@/layouts/app.astro"
import { getDictionary } from "@/i18n"
import { CalendarPage } from "@/components/calendar/calendar-page"
import { getRequestSession } from "@/lib/auth/request-session"
import { fetchProjects } from "@/services/projects/projects.repository"
import { fetchMyTasks } from "@/services/tasks/tasks.repository"

const session = getRequestSession(Astro.cookies, Astro.locals)
if (!session) return Astro.redirect("/login")

const locale = Astro.currentLocale ?? "de"
const dict = getDictionary(locale)
const [projects, tasks] = await Promise.all([
  fetchProjects(session.tokens.accessToken),
  fetchMyTasks(session.tokens.accessToken),
])
---
```

und `<CalendarPage client:load locale={locale} />` → `<CalendarPage client:load locale={locale} projects={projects} tasks={tasks} />`.

- [ ] **Step 5: Ungenutzte Dummy-Dateien löschen**

```bash
git rm src/dummy-data/tasks.ts src/dummy-data/project-stats.ts src/dummy-data/work-time.ts
```

Run: `grep -rn "dummy-data/" src` → nur noch Treffer in `dummy-data/*` selbst, `lib/time-tracking/repository.ts` und `components/time-tracking/time-tracking-workspace.tsx`.

- [ ] **Step 6: Prüfen**

Run: `npm test` → grün; `npx astro check` → `0 errors`; `npx eslint src` → keine Ausgabe

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/pages/index.astro src/pages/projects.astro src/pages/tasks.astro src/pages/calendar.astro src/components/dashboard/project-stats/project-stats.tsx src/components/dashboard/projects/projects-table.tsx src/components/dashboard/my-tasks/my-tasks.tsx src/components/dashboard/work-time/weekly-work-time.tsx src/components/projects/projects-page.tsx src/components/tasks/tasks-page.tsx src/components/calendar/calendar-page.tsx
git add -A src
git commit -m "feat(web): load dashboard, projects, tasks and calendar from Directus

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Prüfung gegen die echte Directus-Instanz

**Files:** keine Änderungen.

- [ ] **Step 1: Dev-Server starten** (benötigt `apps/web/.env` mit `DIRECTUS_URL`; läuft wie im Alltag)

Run: `npm run dev` (im Hintergrund)

- [ ] **Step 2: Seiten abrufen** – nach Login als Admin im Browser (oder per Session-Cookie) prüfen:
  - `/`: 4 Kennzahlen mit Werten > 0, Projekttabelle mit Namen wie `Weber_4526_Flyer_Jubilaeum`, „Meine Aufgaben“ für heute, Wochen-Arbeitszeit ~6–9 h je vergangenem Werktag, Kundenkontakte wie bisher.
  - `/projects`: 25 Projekte abzüglich stornierter, Status-Filter funktioniert.
  - `/tasks`: Gruppen (überfällig/heute/…) gefüllt, erfasste Zeiten sichtbar.
  - `/calendar`: Projekte (PAL) und Aufgaben im aktuellen Monat.
  - `/time-tracking`: unverändert (Dummy).

- [ ] **Step 3: Ergebnis melden** (kein Commit)
