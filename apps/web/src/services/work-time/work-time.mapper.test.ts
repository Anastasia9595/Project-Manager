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
    expect(days.map((day) => day.label)).toEqual([
      "MON",
      "DIE",
      "MIT",
      "DON",
      "FRE",
    ])
    expect(days.map((day) => day.name)).toEqual([
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
    ])
    expect(days.map((day) => day.actualHours)).toEqual([3.5, 0, 4, 0, 0])
    expect(days.map((day) => day.targetHours)).toEqual([8, 8, 8, 8, 8])
  })

  it("nimmt ein abweichendes Tages-Soll", () => {
    const days = toWorkWeek([], monday, () => 240)
    expect(days.map((day) => day.targetHours)).toEqual([4, 4, 4, 4, 4])
  })
})
