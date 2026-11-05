import { describe, expect, it } from "vitest"

import { getProjectStats } from "@/lib/project-stats"
import type { Project } from "@/models/project"

const project = (
  id: string,
  palDate: Date,
  status: Project["status"] = "active"
): Project => ({
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
