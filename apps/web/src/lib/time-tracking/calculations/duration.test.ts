import { describe, expect, it } from "vitest"

import {
  formatDuration,
  formatOptionalDuration,
  formatOptionalSignedDuration,
  formatSignedDuration,
} from "@/lib/time-tracking/calculations/duration"

describe("formatDuration", () => {
  it("formatiert Minuten als H:MM h", () => {
    expect(formatDuration(0)).toBe("0:00 h")
    expect(formatDuration(190)).toBe("3:10 h")
    expect(formatDuration(1470)).toBe("24:30 h")
  })

  it("zeigt Differenzen mit Vorzeichen", () => {
    expect(formatSignedDuration(180)).toBe("+3:00 h")
    expect(formatSignedDuration(-90)).toBe("−1:30 h")
    expect(formatSignedDuration(0)).toBe("0:00 h")
  })

  it("zeigt Nullwerte und fehlende Werte als Strich", () => {
    expect(formatOptionalDuration(0)).toBe("—")
    expect(formatOptionalDuration(null)).toBe("—")
    expect(formatOptionalDuration(70)).toBe("1:10 h")
    expect(formatOptionalSignedDuration(null)).toBe("—")
    expect(formatOptionalSignedDuration(0)).toBe("0:00 h")
  })
})
