import { describe, expect, it } from "vitest"

import en from "@/i18n/en"
import { formatDayMonth, getDueFooter } from "@/lib/calendar/due-footer"

const TODAY = new Date(2026, 9, 12, 15, 30)

function open(dueDate: Date) {
  return { dueDate, done: false }
}

describe("formatDayMonth", () => {
  it("formatiert als TT.MM mit führenden Nullen", () => {
    expect(formatDayMonth(new Date(2026, 1, 3))).toBe("03.02")
    expect(formatDayMonth(new Date(2026, 11, 24))).toBe("24.12")
  })
})

describe("getDueFooter", () => {
  it("überfällig seit mehreren Tagen -> rot mit Anzahl Tage", () => {
    expect(getDueFooter(open(new Date(2026, 9, 8)), TODAY)).toEqual({
      tone: "overdue",
      label: "Fällig am 08.10 · seit 4 Tagen",
    })
  })

  it("überfällig seit einem Tag -> 'seit gestern'", () => {
    expect(getDueFooter(open(new Date(2026, 9, 11, 23, 59)), TODAY)).toEqual({
      tone: "overdue",
      label: "Fällig am 11.10 · seit gestern",
    })
  })

  it("heute fällig, unabhängig von der Uhrzeit", () => {
    expect(getDueFooter(open(new Date(2026, 9, 12, 0, 0)), TODAY)).toEqual({
      tone: "today",
      label: "Heute fällig",
    })
    expect(getDueFooter(open(new Date(2026, 9, 12, 23, 59)), TODAY).tone).toBe(
      "today"
    )
  })

  it("morgen fällig -> amber mit 'morgen'", () => {
    expect(getDueFooter(open(new Date(2026, 9, 13)), TODAY)).toEqual({
      tone: "soon",
      label: "Fällig am 13.10 · morgen",
    })
  })

  it("in 2 Tagen fällig -> amber mit Anzahl Tage", () => {
    expect(getDueFooter(open(new Date(2026, 9, 14)), TODAY)).toEqual({
      tone: "soon",
      label: "Fällig am 14.10 · in 2 Tagen",
    })
  })

  it("ab 3 Tagen -> grau nur mit Datum", () => {
    expect(getDueFooter(open(new Date(2026, 9, 15)), TODAY)).toEqual({
      tone: "later",
      label: "Fällig am 15.10",
    })
  })

  it("abgeschlossen -> grau mit Abschlussdatum, auch wenn überfällig", () => {
    expect(
      getDueFooter(
        {
          dueDate: new Date(2026, 9, 1),
          done: true,
          completedAt: new Date(2026, 9, 10),
        },
        TODAY
      )
    ).toEqual({ tone: "done", label: "Abgeschlossen am 10.10" })
  })

  it("abgeschlossen ohne Abschlussdatum", () => {
    expect(
      getDueFooter({ dueDate: new Date(2026, 9, 1), done: true }, TODAY)
    ).toEqual({ tone: "done", label: "Abgeschlossen" })
  })

  it("zählt Kalendertage über Monats- und Jahresgrenzen", () => {
    const newYear = new Date(2027, 0, 1)
    expect(getDueFooter(open(new Date(2026, 11, 30)), newYear).label).toBe(
      "Fällig am 30.12 · seit 2 Tagen"
    )
  })

  it("zählt über die Zeitumstellung hinweg korrekt", () => {
    // Umstellung auf Winterzeit am 25.10.2026
    const beforeSwitch = new Date(2026, 9, 24, 12)
    expect(getDueFooter(open(new Date(2026, 9, 26)), beforeSwitch).label).toBe(
      "Fällig am 26.10 · in 2 Tagen"
    )
  })

  it("nutzt übergebene Übersetzungen", () => {
    expect(
      getDueFooter(open(new Date(2026, 9, 9)), TODAY, en.calendarPage.footer)
        .label
    ).toBe("Due 09.10 · 3 days ago")
  })
})
