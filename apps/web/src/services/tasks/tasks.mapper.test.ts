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
    const cancelled = {
      ...row,
      id: "t2",
      printing_lines: { ...row.printing_lines!, status: "cancelled" as const },
    }
    expect(toTrackedTask(cancelled)).toBeNull()
    expect(toTrackedTask({ ...row, due_date: null })).toBeNull()
    expect(toTrackedTasks([row, cancelled]).map((task) => task.id)).toEqual([
      "t1",
    ])
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
