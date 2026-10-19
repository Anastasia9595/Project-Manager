import { describe, expect, it } from "vitest"

import {
  targetsByDay,
  withDailyTargetOverrides,
} from "@/lib/time-tracking/calculations/daily-target"
import {
  booking,
  DAYS,
  WEDNESDAY,
} from "@/lib/time-tracking/calculations/test-fixtures"
import {
  differencesByDay,
  entriesWithin,
  exceedsDailyLimit,
  hideFutureDays,
  minutesByDay,
  minutesOnDayExcept,
  progressPercent,
  sumDifferences,
  summarizeWeek,
} from "@/lib/time-tracking/calculations/totals"

describe("Summen", () => {
  const entries = [
    booking({ id: "a", date: "2026-10-12", duration_minutes: 120 }),
    booking({ id: "b", date: "2026-10-12", duration_minutes: 30 }),
    booking({ id: "c", date: "2026-10-14", duration_minutes: 40 }),
  ]

  it("summiert je Tag in der Reihenfolge der Tage", () => {
    expect(minutesByDay(entries, DAYS)).toEqual([150, 0, 40, 0, 0])
  })

  it("zählt einen Tag ohne den bearbeiteten Eintrag", () => {
    expect(minutesOnDayExcept(entries, DAYS[0]!, "b")).toBe(120)
    expect(minutesOnDayExcept(entries, DAYS[0]!, undefined)).toBe(150)
  })

  it("filtert auf die übergebenen Tage", () => {
    const weekend = booking({ id: "s", date: "2026-10-17" })
    expect(entriesWithin([...entries, weekend], DAYS)).toEqual(entries)
  })
})

describe("Soll und Differenz", () => {
  it("rechnet 8 h je Werktag", () => {
    expect(targetsByDay(DAYS)).toEqual([480, 480, 480, 480, 480])
  })

  it("lässt einzelne Tage überschreiben (z.B. Feiertag)", () => {
    const target = withDailyTargetOverrides(new Map([["2026-10-13", 0]]))
    expect(targetsByDay(DAYS, target)).toEqual([480, 0, 480, 480, 480])
  })

  it("blendet Werte zukünftiger Tage aus", () => {
    expect(hideFutureDays([60, 0, 30, 90, 0], DAYS, WEDNESDAY)).toEqual([
      60, 0, 30, null, null,
    ])
  })

  it("rechnet die Differenz nur bis heute", () => {
    const actual = [660, 390, 190, 0, 0]
    const differences = differencesByDay(actual, targetsByDay(DAYS), DAYS, WEDNESDAY)
    expect(differences).toEqual([180, -90, -290, null, null])
    expect(sumDifferences(differences)).toBe(-200)
  })

  it("fasst die Woche zusammen", () => {
    const totals = summarizeWeek(
      [booking({ date: "2026-10-12", duration_minutes: 660 })],
      DAYS,
      WEDNESDAY
    )
    expect(totals.week).toBe(660)
    expect(totals.weekTarget).toBe(2400)
    // Mo +3:00, Di −8:00, Mi −8:00; Do/Fr zählen noch nicht.
    expect(totals.weekDifference).toBe(180 - 480 - 480)
  })

  it("berechnet den Fortschritt in ganzen Prozent", () => {
    expect(progressPercent(1470, 2400)).toBe(61)
    expect(progressPercent(100, 0)).toBe(0)
    // 39:57 von 40:00 h ist noch nicht erreicht.
    expect(progressPercent(2397, 2400)).toBe(99)
  })

  it("warnt erst ab mehr als 10 Stunden", () => {
    expect(exceedsDailyLimit(600)).toBe(false)
    expect(exceedsDailyLimit(601)).toBe(true)
  })
})
