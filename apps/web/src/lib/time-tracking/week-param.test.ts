import { describe, expect, it } from "vitest"

import {
  formatBookingDate,
  formatColumnDay,
  formatShortDate,
  formatWeekRange,
} from "@/lib/time-tracking/date-labels"
import {
  formatWeekParam,
  parseWeekParam,
  resolveWeekStart,
} from "@/lib/time-tracking/week-param"

describe("Wochen-Parameter", () => {
  it("formatiert ein Datum als ISO-Woche", () => {
    expect(formatWeekParam(new Date(2026, 9, 14))).toBe("2026-W42")
    expect(formatWeekParam(new Date(2026, 0, 5))).toBe("2026-W02")
  })

  it("nutzt das ISO-Wochenjahr am Jahreswechsel", () => {
    // Mo, 29.12.2025 gehört schon zu KW 1/2026.
    expect(formatWeekParam(new Date(2025, 11, 31))).toBe("2026-W01")
    // Fr, 1.1.2027 gehört noch zu KW 53/2026.
    expect(formatWeekParam(new Date(2027, 0, 1))).toBe("2026-W53")
  })

  it("liefert den Montag der Woche", () => {
    expect(parseWeekParam("2026-W42")).toEqual(new Date(2026, 9, 12))
    expect(parseWeekParam("2026-W01")).toEqual(new Date(2025, 11, 29))
    expect(parseWeekParam("2026-W53")).toEqual(new Date(2026, 11, 28))
  })

  it("lehnt ungültige Werte ab", () => {
    expect(parseWeekParam(null)).toBeNull()
    expect(parseWeekParam("2026-42")).toBeNull()
    expect(parseWeekParam("2026-W00")).toBeNull()
    // 2025 hat nur 52 Wochen.
    expect(parseWeekParam("2025-W53")).toBeNull()
  })

  it("fällt ohne gültigen Parameter auf die aktuelle Woche zurück", () => {
    const today = new Date(2026, 9, 18)
    expect(resolveWeekStart("kaputt", today)).toEqual(new Date(2026, 9, 12))
    expect(resolveWeekStart("2026-W40", today)).toEqual(new Date(2026, 8, 28))
  })
})

describe("Datumsbeschriftungen", () => {
  it("kürzt den Wochenzeitraum", () => {
    expect(formatWeekRange(new Date(2026, 9, 12))).toBe("12.–18. Okt. 2026")
    expect(formatWeekRange(new Date(2026, 8, 28))).toBe("28. Sep.–4. Okt. 2026")
    expect(formatWeekRange(new Date(2025, 11, 29))).toBe("29. Dez. 2025–4. Jan. 2026")
  })

  it("formatiert Tage für Formular, Spalten und Screenreader", () => {
    const wednesday = new Date(2026, 9, 14)
    expect(formatBookingDate(wednesday)).toBe("Mi, 14.10.2026")
    expect(formatColumnDay(wednesday)).toBe("Mi 14.")
    expect(formatShortDate(wednesday)).toBe("Mi 14.10.")
  })
})
