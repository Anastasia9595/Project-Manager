import { describe, expect, it } from "vitest"

import {
  isBookingChanges,
  isWritableBooking,
  toTimeBooking,
  toTimeEntryChanges,
  toTimeEntryWrite,
} from "@/services/time-entries/time-entries.mapper"

describe("toTimeBooking", () => {
  it("bildet eine Directus-Zeile auf eine Buchung ab", () => {
    expect(
      toTimeBooking({
        id: "e1",
        work_date: "2026-11-04",
        hours: 1,
        minutes: 30,
        note: "Satz",
        user_created: "u1",
        task: { id: "t1", printing_lines: { id: "p1" } },
      })
    ).toEqual({
      id: "e1",
      project: "p1",
      task: "t1",
      date: "2026-11-04",
      duration_minutes: 90,
      description: "Satz",
      user: "u1",
    })
  })

  it("setzt fehlende Werte auf neutrale Standardwerte", () => {
    expect(
      toTimeBooking({
        id: "e2",
        work_date: "2026-11-04",
        hours: null,
        minutes: 45,
        note: null,
        user_created: null,
        task: null,
      })
    ).toEqual({
      id: "e2",
      project: "",
      task: "",
      date: "2026-11-04",
      duration_minutes: 45,
      description: null,
      user: "",
    })
  })
})

describe("toTimeEntryWrite", () => {
  it("teilt die Dauer in Stunden und Minuten", () => {
    expect(
      toTimeEntryWrite({
        task: "t1",
        date: "2026-11-04",
        duration_minutes: 135,
        description: null,
      })
    ).toEqual({
      task: "t1",
      work_date: "2026-11-04",
      hours: 2,
      minutes: 15,
      note: null,
    })
  })

  it("übersetzt Änderungen nur für gelieferte Felder", () => {
    expect(toTimeEntryChanges({ description: "neu" })).toEqual({ note: "neu" })
    expect(
      toTimeEntryChanges({ duration_minutes: 60, date: "2026-11-05" })
    ).toEqual({ hours: 1, minutes: 0, work_date: "2026-11-05" })
  })
})

describe("Body-Prüfung", () => {
  const ok = {
    task: "t1",
    date: "2026-11-04",
    duration_minutes: 30,
    description: null,
  }

  it("akzeptiert gültige Buchungen", () => {
    expect(isWritableBooking(ok)).toBe(true)
    expect(isWritableBooking({ ...ok, description: "x".repeat(2000) })).toBe(
      true
    )
    expect(isBookingChanges({ description: "x" })).toBe(true)
  })

  it.each([
    [null],
    [[]],
    [{ ...ok, task: "" }],
    [{ ...ok, date: "04.11.2026" }],
    [{ ...ok, date: "2026-02-30" }],
    [{ ...ok, duration_minutes: 0 }],
    [{ ...ok, duration_minutes: 1441 }],
    [{ ...ok, duration_minutes: 1.5 }],
    [{ ...ok, description: "x".repeat(2001) }],
  ])("lehnt %j ab", (body) => {
    expect(isWritableBooking(body)).toBe(false)
  })

  it("lehnt leere oder ungültige Änderungen ab", () => {
    expect(isBookingChanges({})).toBe(false)
    expect(isBookingChanges({ duration_minutes: -1 })).toBe(false)
    expect(isBookingChanges({ date: "2026-02-30" })).toBe(false)
  })
})
