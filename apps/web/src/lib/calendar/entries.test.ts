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

const TODAY = new Date(2026, 9, 12, 9)

function task(overrides: Partial<Task>): Task {
  return {
    id: "1",
    title: "Briefing",
    projectName: "Projekt A",
    priority: "medium",
    dueDate: TODAY,
    done: false,
    ...overrides,
  }
}

function project(overrides: Partial<Project>): Project {
  return {
    id: "1",
    name: "Projekt A",
    status: "active",
    palDate: new Date(2026, 9, 20),
    dataHandoverDate: new Date(2026, 9, 18),
    customer: "Kunde",
    progress: { done: 2, total: 5 },
    circulation: 1000,
    ...overrides,
  }
}

function trackedTask(
  overrides: Partial<TrackedTask> & { id: string }
): TrackedTask {
  return {
    ...task(overrides),
    projectId: "1",
    customer: "Kunde",
    timeEntries: [],
    ...overrides,
  }
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
    expect(getStartedTaskIds(tasks, [entry("a")], null)).toEqual(new Set(["a"]))
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

describe("projectToEntry", () => {
  it("nutzt das PAL-Datum als Fälligkeit", () => {
    expect(projectToEntry(project({}))?.dueDate).toEqual(new Date(2026, 9, 20))
  })

  it("zeigt nur aktive Projekte (In Bearbeitung)", () => {
    expect(projectToEntry(project({}))?.status).toBe("inProgress")
    expect(projectToEntry(project({ status: "created" }))).toBeNull()
    expect(projectToEntry(project({ status: "paused" }))).toBeNull()
    expect(projectToEntry(project({ status: "completed" }))).toBeNull()
  })
})

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

describe("groupEntriesByDay", () => {
  const day = new Date(2026, 9, 5)
  const entry = (
    id: string,
    status: CalendarEntry["status"],
    dueDate = day
  ): CalendarEntry => ({
    kind: "task",
    id,
    taskId: id,
    title: id,
    projectName: "",
    dueDate,
    status,
  })

  it("sortiert je Tag: Überfällig -> In Bearbeitung -> Offen -> Abgeschlossen", () => {
    const groups = groupEntriesByDay([
      entry("done", "done"),
      entry("open", "open"),
      entry("progress", "inProgress"),
      entry("overdue", "overdue"),
    ])
    expect(groups.get("2026-10-05")?.map((e) => e.id)).toEqual([
      "overdue",
      "progress",
      "open",
      "done",
    ])
  })

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

  it("bei gleichem Status zuerst die frühere Fälligkeit", () => {
    const groups = groupEntriesByDay([
      entry("late", "overdue", new Date(2026, 9, 5, 16)),
      entry("early", "overdue", new Date(2026, 9, 5, 8)),
    ])
    expect(groups.get("2026-10-05")?.map((e) => e.id)).toEqual([
      "early",
      "late",
    ])
  })

  it("bei gleichem Status und Datum steht das Projekt vor der Aufgabe", () => {
    const projectEntry: CalendarEntry = {
      kind: "project",
      id: "project",
      name: "Projekt",
      customer: "Kunde",
      progress: { done: 1, total: 2 },
      dueDate: day,
      status: "inProgress",
    }
    const groups = groupEntriesByDay([
      entry("task", "inProgress"),
      projectEntry,
    ])
    expect(groups.get("2026-10-05")?.map((e) => e.id)).toEqual([
      "project",
      "task",
    ])
  })

  it("trennt Einträge nach Kalendertag", () => {
    const groups = groupEntriesByDay([
      entry("a", "done", new Date(2026, 9, 5)),
      entry("b", "done", new Date(2026, 9, 6)),
    ])
    expect([...groups.keys()]).toEqual(["2026-10-05", "2026-10-06"])
  })
})

describe("toDayKey", () => {
  it("nutzt Ortszeit mit führenden Nullen", () => {
    expect(toDayKey(new Date(2026, 0, 3, 23, 59))).toBe("2026-01-03")
  })
})

describe("withPinnedOrder", () => {
  const entry = (
    id: string,
    status: CalendarEntry["status"]
  ): CalendarEntry => ({
    kind: "task",
    id,
    taskId: id,
    title: id,
    projectName: "",
    dueDate: new Date(2026, 9, 12),
    status,
  })

  it("behält die gemerkte Reihenfolge, auch wenn sich der Status ändert", () => {
    // "a" war In Bearbeitung und wurde abgehakt -> würde sonst ans Ende rutschen
    const groups = groupEntriesByDay([
      entry("a", "done"),
      entry("b", "open"),
      entry("c", "open"),
    ])
    const pinned = withPinnedOrder(groups, { "2026-10-12": ["a", "b", "c"] })
    expect(pinned.get("2026-10-12")?.map((e) => e.id)).toEqual(["a", "b", "c"])
  })

  it("hängt neue Einträge sortiert hinten an", () => {
    const groups = groupEntriesByDay([
      entry("new-done", "done"),
      entry("a", "done"),
      entry("new-overdue", "overdue"),
    ])
    const pinned = withPinnedOrder(groups, { "2026-10-12": ["a"] })
    expect(pinned.get("2026-10-12")?.map((e) => e.id)).toEqual([
      "a",
      "new-overdue",
      "new-done",
    ])
  })

  it("lässt Tage ohne gemerkte Reihenfolge unverändert", () => {
    const groups = groupEntriesByDay([entry("b", "done"), entry("a", "open")])
    expect(
      withPinnedOrder(groups, {})
        .get("2026-10-12")
        ?.map((e) => e.id)
    ).toEqual(["a", "b"])
  })
})
