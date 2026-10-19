import { describe, expect, it } from "vitest"

import {
  bookingToValues,
  emptyBookingValues,
  firstInvalidField,
  toBookingInput,
  validateBooking,
} from "@/lib/time-tracking/booking-form"

describe("validateBooking", () => {
  it("meldet fehlendes Projekt, Aufgabe und Dauer", () => {
    const errors = validateBooking(emptyBookingValues("2026-10-14"))
    expect(errors).toEqual({ project: true, task: true, duration: "tooShort" })
    expect(firstInvalidField(errors)).toBe("project")
  })

  it("begrenzt die Beschreibung auf 255 Zeichen", () => {
    const values = {
      ...emptyBookingValues("2026-10-14"),
      projectId: "p1",
      taskId: "t1",
      minutes: "30",
    }
    expect(validateBooking({ ...values, description: "a".repeat(255) })).toEqual({})
    expect(validateBooking({ ...values, description: "a".repeat(256) })).toEqual({
      description: true,
    })
  })

  it("akzeptiert eine vollständige Buchung ab 1 Minute", () => {
    const values = {
      ...emptyBookingValues("2026-10-14"),
      projectId: "p1",
      taskId: "t1",
      minutes: "1",
    }
    expect(validateBooking(values)).toEqual({})
  })
})

describe("Umwandlung", () => {
  const entry = {
    id: "e1",
    project: "p1",
    task: "t1",
    date: "2026-10-14",
    duration_minutes: 70,
    description: null,
    user: "u1",
  }

  it("lädt eine Buchung ins Formular", () => {
    expect(bookingToValues(entry)).toEqual({
      projectId: "p1",
      taskId: "t1",
      date: "2026-10-14",
      hours: "1",
      minutes: "10",
      description: "",
    })
  })

  it("speichert leere Beschreibungen als null", () => {
    const values = { ...bookingToValues(entry), description: "   " }
    expect(toBookingInput(values, "u2")).toEqual({
      project: "p1",
      task: "t1",
      date: "2026-10-14",
      duration_minutes: 70,
      description: null,
      user: "u2",
    })
  })
})
