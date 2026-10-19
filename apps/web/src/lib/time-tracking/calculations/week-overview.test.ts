import { describe, expect, it } from "vitest"

import {
  booking,
  DAYS,
  project,
  task,
} from "@/lib/time-tracking/calculations/test-fixtures"
import {
  buildWeekOverview,
  sortOverview,
  toggleSort,
} from "@/lib/time-tracking/calculations/week-overview"

describe("buildWeekOverview", () => {
  const projects = [project("p1", "Bravo"), project("p2", "Alpha"), project("p3", "Ohne Buchung")]
  const tasks = [
    task("t1", "p1", "Korrektur"),
    task("t2", "p1", "Aufstellung"),
    task("t3", "p2", "Layout"),
    task("t4", "p3", "Briefing"),
  ]
  const entries = [
    booking({ id: "a", task: "t1", project: "p1", date: "2026-10-12", duration_minutes: 60 }),
    booking({ id: "b", task: "t1", project: "p1", date: "2026-10-14", duration_minutes: 70 }),
    booking({ id: "c", task: "t3", project: "p2", date: "2026-10-13", duration_minutes: 300 }),
  ]
  const overview = buildWeekOverview(entries, projects, tasks, DAYS)

  it("zeigt nur Projekte mit Buchungen, jeweils mit allen Aufgaben", () => {
    expect(overview.map((group) => group.project.id)).toEqual(["p1", "p2"])
    expect(overview[0]!.tasks.map((row) => row.task.id)).toEqual(["t1", "t2"])
  })

  it("bildet Zwischensummen je Projekt und Aufgabe", () => {
    expect(overview[0]!.minutesByDay).toEqual([60, 0, 70, 0, 0])
    expect(overview[0]!.total).toBe(130)
    expect(overview[0]!.tasks[1]!.total).toBe(0)
  })

  it("sortiert nach Name und Summe", () => {
    const byName = sortOverview(overview, { key: "name", direction: "asc" })
    expect(byName.map((group) => group.project.id)).toEqual(["p2", "p1"])
    expect(byName[1]!.tasks.map((row) => row.task.title)).toEqual(["Aufstellung", "Korrektur"])

    const byTotal = sortOverview(overview, { key: "total", direction: "desc" })
    expect(byTotal.map((group) => group.project.id)).toEqual(["p2", "p1"])
  })

  it("lässt die Reihenfolge ohne Sortierung unverändert", () => {
    expect(sortOverview(overview, null)).toBe(overview)
  })
})

describe("toggleSort", () => {
  it("startet aufsteigend und kehrt bei erneutem Klick um", () => {
    const first = toggleSort(null, "total")
    expect(first).toEqual({ key: "total", direction: "asc" })
    expect(toggleSort(first, "total")).toEqual({ key: "total", direction: "desc" })
    expect(toggleSort(first, "name")).toEqual({ key: "name", direction: "asc" })
  })
})
