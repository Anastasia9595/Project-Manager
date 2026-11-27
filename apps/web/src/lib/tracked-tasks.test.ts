import { describe, expect, it } from "vitest"

import {
  EMPTY_TASK_FILTER,
  countFilterOptions,
  matchesTaskFilter,
} from "@/lib/tracked-tasks"
import type { TrackedTask } from "@/models/task"

const task: TrackedTask = {
  id: "1",
  title: "Druckdaten prüfen",
  projectId: "p1",
  projectName: "Flyer",
  customer: "Muster GmbH",
  priority: "high",
  dueDate: new Date(2026, 10, 27),
  done: false,
  timeEntries: [],
}

describe("matchesTaskFilter", () => {
  it("lässt ohne Auswahl alles durch", () => {
    expect(matchesTaskFilter(task, EMPTY_TASK_FILTER)).toBe(true)
  })

  it("verknüpft Werte eines Kriteriums mit oder", () => {
    const filter = { ...EMPTY_TASK_FILTER, priority: ["low", "high"] }
    expect(matchesTaskFilter(task, filter)).toBe(true)
  })

  it("verknüpft die Kriterien mit und", () => {
    const filter = { priority: ["high"], project: ["p1"], customer: ["Andere"] }
    expect(matchesTaskFilter(task, filter)).toBe(false)
  })

  it("filtert das Projekt über die ID", () => {
    const filter = { ...EMPTY_TASK_FILTER, project: ["p2"] }
    expect(matchesTaskFilter(task, filter)).toBe(false)
  })
})

describe("countFilterOptions", () => {
  it("zählt je Wert, sortiert alphabetisch und lässt leere weg", () => {
    expect(
      countFilterOptions([
        ["p2", "Zeitung"],
        ["p1", "Anzeige"],
        ["p2", "Zeitung"],
        ["", "Ohne"],
      ])
    ).toEqual([
      { value: "p1", label: "Anzeige", count: 1 },
      { value: "p2", label: "Zeitung", count: 2 },
    ])
  })
})
