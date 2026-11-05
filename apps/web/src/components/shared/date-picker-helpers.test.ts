import { describe, expect, it } from "vitest"

import {
  formatPickerDate,
  isBeforeMinDate,
} from "@/components/shared/date-picker-helpers"

describe("formatPickerDate", () => {
  it("formatiert deutsch als TT.MM.JJJJ", () => {
    expect(formatPickerDate("2026-11-05", "de")).toBe("05.11.2026")
  })

  it("formatiert englisch als MM/DD/YYYY", () => {
    expect(formatPickerDate("2026-11-05", "en")).toBe("11/05/2026")
  })

  it("lässt einen leeren Wert leer", () => {
    expect(formatPickerDate("", "de")).toBe("")
  })
})

describe("isBeforeMinDate", () => {
  const min = "2026-11-05"

  it("sperrt frühere Tage", () => {
    expect(isBeforeMinDate(new Date(2026, 10, 4), min)).toBe(true)
  })

  it("erlaubt den Mindesttag und spätere Tage", () => {
    expect(isBeforeMinDate(new Date(2026, 10, 5), min)).toBe(false)
    expect(isBeforeMinDate(new Date(2026, 10, 6), min)).toBe(false)
  })

  it("sperrt nichts ohne Mindestdatum", () => {
    expect(isBeforeMinDate(new Date(2000, 0, 1))).toBe(false)
  })
})
