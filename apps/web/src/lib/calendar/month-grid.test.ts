import { describe, expect, it } from "vitest"

import { getMonthGrid } from "@/lib/calendar/month-grid"
import { toDayKey } from "@/lib/calendar/entries"

describe("getMonthGrid", () => {
  it("beginnt montags und füllt mit Tagen aus Vor- und Folgemonat auf", () => {
    // Oktober 2026: 1.10. ist ein Donnerstag, 31.10. ein Samstag
    const weeks = getMonthGrid(new Date(2026, 9, 12))
    expect(weeks).toHaveLength(5)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(toDayKey(weeks[0]![0]!)).toBe("2026-09-28")
    expect(toDayKey(weeks[4]![6]!)).toBe("2026-11-01")
  })

  it("liefert 6 Wochen, wenn der Monat sie braucht", () => {
    // August 2026: beginnt Samstag, endet Montag
    expect(getMonthGrid(new Date(2026, 7, 1))).toHaveLength(6)
  })

  it("liefert 4 Wochen für einen Februar, der montags beginnt", () => {
    expect(getMonthGrid(new Date(2027, 1, 1))).toHaveLength(4)
  })
})
