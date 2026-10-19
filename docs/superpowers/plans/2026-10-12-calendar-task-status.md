# Kalender: Aufgaben-Status aus der Zeiterfassung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** „In Bearbeitung“ wird im Kalender automatisch aus der Zeiterfassung abgeleitet statt aus einem manuellen Feld; Abhaken stoppt einen laufenden Timer.

**Architecture:** Reine Ableitung in `lib/calendar/entries.ts`: `getStartedTaskIds` sammelt alle Aufgaben mit Zeiteinträgen bzw. laufendem Timer, `taskToEntry` leitet daraus den Chip-Status ab. `CalendarPage` liest dafür den bestehenden Zustand-Store `useTaskTimerStore`. Gespeichert wird nur `done`.

**Tech Stack:** Astro 7 + React 19, TypeScript, Zustand (`useTaskTimerStore`), Vitest 3.

**Spec:** `docs/superpowers/specs/2026-10-12-calendar-task-status-design.md`

## Global Constraints

- Alle Befehle aus `apps/web` ausführen (`cd apps/web`), sofern nicht anders angegeben.
- Tests: `npm test` (= `vitest run`, Zeitzone in `vitest.config.ts` fest auf `Europe/Berlin`).
- Typecheck: `npx astro check` → erwartet `0 errors`. Lint: `npx eslint src` → keine Ausgabe.
- Prettier **nur auf geänderte Dateien** anwenden (`npx prettier --write <dateien>`), nie auf ganze Ordner – sonst werden fremde Dateien umformatiert.
- Code-Kommentare und Testnamen auf Deutsch, wie im restlichen Projekt.
- Commit-Messages enden mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Chip-Status einer Aufgabe (Spec-Tabelle):
  - erledigt → `"done"`
  - nicht erledigt, Timer läuft oder Zeit gebucht → `"inProgress"` (auch wenn überfällig)
  - nicht erledigt, keine Zeit, Fälligkeit < heute → `"overdue"`
  - sonst → `"open"`

---

### Task 1: Baseline-Commit der bisherigen Kalender-Arbeit

Die bisherige Kalender-Umsetzung ist noch nicht committet. Damit die folgenden Tasks saubere, kleine Diffs ergeben, wird sie zuerst unverändert committet. **Nur ausführen, wenn die Nutzerin dem Commit zugestimmt hat.**

**Files:** keine Änderungen, nur Commit.

- [ ] **Step 1: Prüfungen laufen lassen**

```bash
cd apps/web
npm test
npx eslint src
npx astro check
```
Expected: `Tests  42 passed (42)`, ESLint ohne Ausgabe, astro check `0 errors`.

- [ ] **Step 2: Nur die Kalender-Dateien stagen und prüfen**

```bash
cd ../..
git add apps/web/package.json apps/web/vitest.config.ts apps/web/src/components/calendar \
  apps/web/src/components/shared/confirm-dialog.tsx apps/web/src/dummy-data/projects.ts \
  apps/web/src/dummy-data/tracked-tasks.ts apps/web/src/i18n/de.ts apps/web/src/i18n/en.ts \
  apps/web/src/lib/calendar apps/web/src/lib/due-date.ts apps/web/src/models/calendar-entry.ts \
  apps/web/src/models/task.ts apps/web/src/pages/calendar.astro apps/web/src/utils/fill-template.ts \
  package.json package-lock.json turbo.json packages/ui/src/components/popover.tsx \
  packages/ui/src/styles/globals.css
git status --short
```
Expected: Keine Zeilen mit ` M` oder `??` mehr (alles gestaged).

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(calendar): add calendar with month, week and day views

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Status aus der Zeiterfassung ableiten (Logik + Daten)

**Files:**
- Modify: `apps/web/src/lib/calendar/entries.ts` (Zeilen 1–75: Imports, `taskToEntry`, `toCalendarEntries`; neu `getStartedTaskIds`)
- Modify: `apps/web/src/models/task.ts:10-11` (Feld `inProgress` entfernen)
- Modify: `apps/web/src/dummy-data/tracked-tasks.ts` (`inProgress` aus `DummyTaskSpec`, den zwei Specs und dem Mapping entfernen)
- Test: `apps/web/src/lib/calendar/entries.test.ts` (Blöcke `taskToEntry` und `toCalendarEntries` ersetzen, Block `getStartedTaskIds` und ein Sortier-Test neu)

**Interfaces:**
- Consumes: `TrackedTask`, `TimeEntry`, `Task` aus `@/models/task`; `diffInCalendarDays(date, today)` aus `@/lib/due-date`.
- Produces:
  - `getStartedTaskIds(tasks: TrackedTask[], bookedEntries: TimeEntry[], activeTaskId: string | null): Set<string>`
  - `taskToEntry(task: Task, today: Date, startedTaskIds?: ReadonlySet<string>): CalendarTaskEntry` (Default: leere Menge)
  - `toCalendarEntries(tasks: Task[], projects: Project[], today: Date, startedTaskIds?: ReadonlySet<string>): CalendarEntry[]` (Default: leere Menge)
  - `Task` hat **kein** Feld `inProgress` mehr.

- [ ] **Step 1: Failing Tests schreiben**

In `apps/web/src/lib/calendar/entries.test.ts`:

1. Import-Block oben ersetzen durch:

```ts
import { describe, expect, it } from "vitest"

import {
  getStartedTaskIds,
  groupEntriesByDay,
  projectToEntry,
  taskToEntry,
  toCalendarEntries,
  toDayKey,
  withPinnedOrder,
} from "@/lib/calendar/entries"
import type { CalendarEntry } from "@/models/calendar-entry"
import type { Project } from "@/models/project"
import type { Task, TrackedTask } from "@/models/task"
```

2. Direkt nach der Funktion `project(...)` (vor `describe("taskToEntry"`) einfügen:

```ts
function trackedTask(
  overrides: Partial<TrackedTask> & { id: string }
): TrackedTask {
  return { ...task(overrides), customer: "Kunde", timeEntries: [], ...overrides }
}

const STARTED = new Set(["1"])

describe("getStartedTaskIds", () => {
  const entry = (taskId: string) => ({
    taskId,
    startedAt: new Date(2026, 9, 12, 8),
    seconds: 600,
  })

  it("enthält Aufgaben mit Zeiteinträgen in den Aufgabendaten", () => {
    const tasks = [
      trackedTask({ id: "a", timeEntries: [entry("a")] }),
      trackedTask({ id: "b" }),
    ]
    expect(getStartedTaskIds(tasks, [], null)).toEqual(new Set(["a"]))
  })

  it("enthält Aufgaben mit nur im Timer-Store gebuchter Zeit", () => {
    const tasks = [trackedTask({ id: "a" })]
    expect(getStartedTaskIds(tasks, [entry("a")], null)).toEqual(
      new Set(["a"])
    )
  })

  it("enthält die Aufgabe mit laufendem Timer", () => {
    const tasks = [trackedTask({ id: "a" })]
    expect(getStartedTaskIds(tasks, [], "a")).toEqual(new Set(["a"]))
  })

  it("ist leer, wenn keine Zeit erfasst wurde", () => {
    expect(getStartedTaskIds([trackedTask({ id: "a" })], [], null)).toEqual(
      new Set()
    )
  })
})
```

3. Den kompletten Block `describe("taskToEntry", ...)` ersetzen durch:

```ts
describe("taskToEntry", () => {
  const yesterday = new Date(2026, 9, 11)

  it("ohne erfasste Zeit und nicht fällig -> Offen", () => {
    expect(taskToEntry(task({}), TODAY).status).toBe("open")
  })

  it("ohne erfasste Zeit und überfällig -> Überfällig", () => {
    expect(taskToEntry(task({ dueDate: yesterday }), TODAY).status).toBe(
      "overdue"
    )
  })

  it("mit erfasster Zeit -> In Bearbeitung", () => {
    expect(taskToEntry(task({}), TODAY, STARTED).status).toBe("inProgress")
  })

  it("mit erfasster Zeit und überfällig -> trotzdem In Bearbeitung", () => {
    expect(
      taskToEntry(task({ dueDate: yesterday }), TODAY, STARTED).status
    ).toBe("inProgress")
  })

  it("erledigt -> Abgeschlossen, auch mit Zeit und überfällig", () => {
    expect(
      taskToEntry(task({ dueDate: yesterday, done: true }), TODAY, STARTED)
        .status
    ).toBe("done")
  })

  it("wieder geöffnet mit gebuchter Zeit -> In Bearbeitung", () => {
    const reopened = task({ done: false, completedAt: undefined })
    expect(taskToEntry(reopened, TODAY, STARTED).status).toBe("inProgress")
  })
})
```

4. Den kompletten Block `describe("toCalendarEntries", ...)` ersetzen durch:

```ts
describe("toCalendarEntries", () => {
  it("zeigt alle Aufgaben, aber nur aktive Projekte", () => {
    const entries = toCalendarEntries(
      [
        task({ id: "a", dueDate: new Date(2026, 9, 10) }),
        task({ id: "b", dueDate: new Date(2026, 9, 14) }),
        task({ id: "c", done: true }),
        task({ id: "d" }),
      ],
      [project({}), project({ id: "2", status: "created" })],
      TODAY,
      new Set(["d"])
    )
    expect(entries.map((entry) => [entry.id, entry.status])).toEqual([
      ["task-a", "overdue"],
      ["task-b", "open"],
      ["task-c", "done"],
      ["task-d", "inProgress"],
      ["project-1", "inProgress"],
    ])
  })
})
```

5. Im Block `describe("groupEntriesByDay", ...)` direkt nach dem Test `"sortiert je Tag: Überfällig -> In Bearbeitung -> Offen -> Abgeschlossen"` einfügen:

```ts
  it("vergangener Tag: unbearbeitet überfällig vor begonnen vor erledigt", () => {
    const pastDay = new Date(2026, 9, 9)
    const entries = toCalendarEntries(
      [
        task({ id: "done", dueDate: pastDay, done: true }),
        task({ id: "started", dueDate: pastDay }),
        task({ id: "untouched", dueDate: pastDay }),
      ],
      [],
      TODAY,
      new Set(["started"])
    )
    expect(
      groupEntriesByDay(entries)
        .get("2026-10-09")
        ?.map((e) => e.id)
    ).toEqual(["task-untouched", "task-started", "task-done"])
  })
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `npx vitest run src/lib/calendar/entries.test.ts`
Expected: FAIL, u. a. `getStartedTaskIds is not a function` und `"mit erfasster Zeit -> In Bearbeitung"` erwartet `"inProgress"`, erhält `"open"`.

- [ ] **Step 3: Implementierung in `entries.ts`**

In `apps/web/src/lib/calendar/entries.ts`:

1. Import ändern:

```ts
import type { Task, TimeEntry, TrackedTask } from "@/models/task"
```

2. Die Funktion `taskToEntry` (bisher Zeilen 28–46) komplett ersetzen durch:

```ts
/**
 * IDs aller Aufgaben, an denen schon gearbeitet wurde: Zeiteinträge in den
 * Aufgabendaten, per Timer gebuchte Zeit (Store) oder aktuell laufender Timer.
 */
export function getStartedTaskIds(
  tasks: TrackedTask[],
  bookedEntries: TimeEntry[],
  activeTaskId: string | null
): Set<string> {
  const ids = new Set<string>()
  for (const task of tasks) {
    if (task.timeEntries.length > 0) ids.add(task.id)
  }
  for (const entry of bookedEntries) ids.add(entry.taskId)
  if (activeTaskId) ids.add(activeTaskId)
  return ids
}

/**
 * Chip-Status: erledigt -> Abgeschlossen; Zeit erfasst -> In Bearbeitung (auch
 * wenn überfällig, die Fußzeile ist dann rot); sonst Überfällig oder Offen.
 */
export function taskToEntry(
  task: Task,
  today: Date,
  startedTaskIds: ReadonlySet<string> = new Set()
): CalendarTaskEntry {
  const status: CalendarEntryStatus = task.done
    ? "done"
    : startedTaskIds.has(task.id)
      ? "inProgress"
      : diffInCalendarDays(task.dueDate, today) < 0
        ? "overdue"
        : "open"
  return {
    kind: "task",
    id: `task-${task.id}`,
    taskId: task.id,
    title: task.title,
    projectName: task.projectName,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    status,
  }
}
```

3. Die Funktion `toCalendarEntries` (bisher Zeilen 62–75) komplett ersetzen durch:

```ts
/**
 * Datenquelle des Kalenders: alle Aufgaben und alle aktiven Projekte als `CalendarEntry`.
 * `startedTaskIds` (siehe `getStartedTaskIds`) bestimmt, welche Aufgaben in Bearbeitung sind.
 * Kommen die Daten später aus Directus, reicht es, sie auf `Task`/`Project` zu mappen.
 */
export function toCalendarEntries(
  tasks: Task[],
  projects: Project[],
  today: Date,
  startedTaskIds: ReadonlySet<string> = new Set()
): CalendarEntry[] {
  return [
    ...tasks.map((task) => taskToEntry(task, today, startedTaskIds)),
    ...projects.flatMap((project) => projectToEntry(project) ?? []),
  ]
}
```

- [ ] **Step 4: Feld `inProgress` aus Modell und Dummy-Daten entfernen**

In `apps/web/src/models/task.ts` diese zwei Zeilen löschen:

```ts
  /** Wird gerade bearbeitet (Status "In Bearbeitung"). */
  inProgress?: boolean
```

In `apps/web/src/dummy-data/tracked-tasks.ts`:
- im Typ `DummyTaskSpec` die Zeilen `/** Aufgabe wird gerade bearbeitet. */` und `inProgress?: boolean` löschen,
- in den Specs „Satz & Layout Prospekt“ und „Bildbearbeitung“ jeweils die Zeile `inProgress: true,` löschen (beide haben Zeiteinträge und bleiben dadurch in Bearbeitung),
- in `createDummyTrackedTasks` die Zeile `inProgress: spec.inProgress,` löschen.

Kontrolle: `grep -rn "inProgress?" src` liefert keine Treffer mehr.

- [ ] **Step 5: Tests, Lint und Typecheck**

```bash
npx prettier --write src/lib/calendar/entries.ts src/lib/calendar/entries.test.ts src/models/task.ts src/dummy-data/tracked-tasks.ts
npm test
npx eslint src
npx astro check
```
Expected: alle Tests grün (`Tests  50 passed (50)`), ESLint ohne Ausgabe, astro check `0 errors`. Die Seite kompiliert weiter, weil `startedTaskIds` einen Default hat.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/calendar/entries.ts apps/web/src/lib/calendar/entries.test.ts \
  apps/web/src/models/task.ts apps/web/src/dummy-data/tracked-tasks.ts
git commit -m "feat(calendar): derive in-progress status from time tracking

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Kalenderseite an die Zeiterfassung anbinden

**Files:**
- Modify: `apps/web/src/components/calendar/calendar-page.tsx`

**Interfaces:**
- Consumes: `getStartedTaskIds`, `toCalendarEntries(…, startedTaskIds)` aus Task 2; `useTaskTimerStore` (`active: ActiveTimer | null`, `entries: TimeEntry[]`, `stop(): void`) und `rehydrateTaskTimer(): () => void` aus `@/lib/task-timer-store`.
- Produces: `CalendarPage` nimmt `tasks?: TrackedTask[]`.

Kein Komponententest (Projekt hat keine React-Testumgebung); Absicherung über die Logik-Tests aus Task 2, Typecheck und manuelle Prüfung.

- [ ] **Step 1: Imports anpassen**

In `calendar-page.tsx`:
- `import { useState } from "react"` ersetzen durch `import { useEffect, useState } from "react"`
- Import aus `@/lib/calendar/entries` ersetzen durch:

```ts
import {
  getStartedTaskIds,
  groupEntriesByDay,
  toCalendarEntries,
  toDayKey,
  withPinnedOrder,
} from "@/lib/calendar/entries"
```

- nach dem Import aus `@/lib/calendar/month-grid` einfügen:

```ts
import { rehydrateTaskTimer, useTaskTimerStore } from "@/lib/task-timer-store"
```

- `import type { Task } from "@/models/task"` ersetzen durch `import type { TrackedTask } from "@/models/task"`

- [ ] **Step 2: Props-Typ und Kommentar**

Den Kommentar über `export function CalendarPage` und den Props-Typ ersetzen:

```ts
// Die Daten kommen per Props rein (Default: Dummy-Daten). Für die API-Anbindung
// Directus-Daten auf `TrackedTask` (inkl. Zeiteinträgen) und `Project` mappen.
// "In Bearbeitung" ergibt sich aus der Zeiterfassung (siehe `getStartedTaskIds`).
export function CalendarPage({
  locale,
  tasks: initialTasks = DUMMY_TRACKED_TASKS,
  projects = DUMMY_PROJECTS,
}: {
  locale?: string
  tasks?: TrackedTask[]
  projects?: Project[]
}) {
```

- [ ] **Step 3: Timer-Store lesen und Status ableiten**

Den Block

```ts
  const entriesByDay = withPinnedOrder(
    groupEntriesByDay(toCalendarEntries(tasks, projects, today)),
    pinnedOrder
  )
```

ersetzen durch:

```ts
  const activeTimer = useTaskTimerStore((state) => state.active)
  const bookedEntries = useTaskTimerStore((state) => state.entries)
  const stopTimer = useTaskTimerStore((state) => state.stop)
  // Gespeicherten Timer erst nach dem Mount laden (siehe task-timer-store).
  useEffect(() => rehydrateTaskTimer(), [])

  const startedTaskIds = getStartedTaskIds(
    tasks,
    bookedEntries,
    activeTimer?.taskId ?? null
  )
  const entriesByDay = withPinnedOrder(
    groupEntriesByDay(
      toCalendarEntries(tasks, projects, today, startedTaskIds)
    ),
    pinnedOrder
  )
```

- [ ] **Step 4: `Task` → `TrackedTask` in den Handlern, Timer beim Abhaken stoppen**

- `function pinDayOf(task: Task)` → `function pinDayOf(task: TrackedTask)`
- `useState<Task | null>(null)` → `useState<TrackedTask | null>(null)`
- In `toggleTask` den `else`-Zweig ersetzen, sodass die Funktion so aussieht:

```ts
  function toggleTask(taskId: string) {
    const task = tasks.find((candidate) => candidate.id === taskId)
    if (!task) return
    pinDayOf(task)
    if (task.done) {
      setTaskToReopen(task)
    } else {
      // Läuft der Timer für diese Aufgabe, Zeit buchen statt weiterlaufen lassen.
      if (activeTimer?.taskId === taskId) stopTimer()
      setTaskDone(taskId, true)
    }
  }
```

- [ ] **Step 5: Lint, Typecheck, Tests**

```bash
npx prettier --write src/components/calendar/calendar-page.tsx
npx eslint src
npx astro check
npm test
```
Expected: ESLint ohne Ausgabe, `0 errors`, alle Tests grün.

- [ ] **Step 6: Manuell im Browser prüfen**

`npm run dev` im Repo-Root, einloggen, dann:
1. `/tasks`: Timer für eine Aufgabe **ohne** bisherige Zeit starten (z. B. „Reinzeichnung“, fällig in 4 Tagen).
2. `/calendar` → Woche: diese Aufgabe zeigt den gelben Chip „In Bearbeitung“.
3. Checkbox dieser Aufgabe anklicken → Chip „Abgeschlossen“; zurück auf `/tasks`: Timer-Leiste ist verschwunden, die Zeit ist gebucht.
4. Im Kalender die Aufgabe wieder öffnen (Dialog bestätigen) → Chip „In Bearbeitung“ (es ist jetzt Zeit gebucht).
5. Eine überfällige Aufgabe mit gebuchter Zeit (z. B. „Aufstellung“, fällig vor 3 Tagen) zeigt gelben Chip und rote Fußzeile „Fällig am … · seit 3 Tagen“.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/calendar/calendar-page.tsx
git commit -m "feat(calendar): read time tracking for task status and stop timer on completion

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
