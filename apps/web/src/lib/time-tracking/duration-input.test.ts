import { describe, expect, it } from "vitest"

import {
  durationMinutes,
  validateDuration,
} from "@/lib/time-tracking/duration-input"

describe("durationMinutes", () => {
  it("rechnet Stunden und Minuten zusammen, leere Felder zählen als 0", () => {
    expect(durationMinutes({ hours: "3", minutes: "" })).toBe(180)
    expect(durationMinutes({ hours: "", minutes: "45" })).toBe(45)
  })
})

describe("validateDuration", () => {
  it("lehnt Dezimal-, Minuswerte und mehr als 59 Minuten ab, statt sie zu kürzen", () => {
    expect(validateDuration({ hours: "1.5", minutes: "" })).toBe("invalid")
    expect(validateDuration({ hours: "-1", minutes: "30" })).toBe("invalid")
    expect(validateDuration({ hours: "", minutes: "60" })).toBe("invalid")
  })

  it("verlangt mindestens 1 Minute", () => {
    expect(validateDuration({ hours: "", minutes: "" })).toBe("tooShort")
    expect(validateDuration({ hours: "1", minutes: "59" })).toBeUndefined()
  })
})
