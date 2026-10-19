import { describe, expect, it } from "vitest"

import {
  getIsoWeek,
  getViewTitle,
  shiftDate,
} from "@/lib/calendar/calendar-view"

const WEEK_TEMPLATE = "KW {week} · {range}"

describe("shiftDate", () => {
  it("springt tageweise", () => {
    expect(shiftDate(new Date(2026, 9, 31), "day", 1)).toEqual(
      new Date(2026, 10, 1)
    )
  })

  it("springt wochenweise", () => {
    expect(shiftDate(new Date(2026, 9, 12), "week", -1)).toEqual(
      new Date(2026, 9, 5)
    )
  })

  it("springt monatsweise und behält den Tag", () => {
    expect(shiftDate(new Date(2026, 9, 12), "month", 1)).toEqual(
      new Date(2026, 10, 12)
    )
  })

  it("kürzt auf den letzten Tag eines kürzeren Monats", () => {
    expect(shiftDate(new Date(2027, 0, 31), "month", 1)).toEqual(
      new Date(2027, 1, 28)
    )
  })

  it("springt über Jahresgrenzen", () => {
    expect(shiftDate(new Date(2026, 0, 15), "month", -1)).toEqual(
      new Date(2025, 11, 15)
    )
  })
})

describe("getIsoWeek", () => {
  it.each([
    [new Date(2026, 9, 12), 42],
    [new Date(2026, 9, 18), 42],
    // 01.01.2027 ist ein Freitag -> gehört noch zur KW 53 von 2026
    [new Date(2027, 0, 1), 53],
    [new Date(2027, 0, 4), 1],
    // 29.12.2025 (Montag) gehört schon zur KW 1 von 2026
    [new Date(2025, 11, 29), 1],
  ])("%s -> KW %i", (date, week) => {
    expect(getIsoWeek(date)).toBe(week)
  })
})

describe("getViewTitle", () => {
  const date = new Date(2026, 9, 14)

  it("Monat", () => {
    expect(getViewTitle(date, "month", WEEK_TEMPLATE)).toBe("Oktober 2026")
  })

  it("Woche mit KW und Zeitraum Mo-So", () => {
    expect(getViewTitle(date, "week", WEEK_TEMPLATE)).toBe(
      "KW 42 · 12.10. – 18.10.2026"
    )
  })

  it("Tag", () => {
    expect(getViewTitle(date, "day", WEEK_TEMPLATE)).toBe(
      "Mittwoch, 14. Oktober 2026"
    )
  })
})
