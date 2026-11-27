import { describe, expect, it } from "vitest"

import { getRelativeDueInfo } from "@/lib/due-date"

const today = new Date(2026, 10, 27)
const info = (month: number, day: number) =>
  getRelativeDueInfo(new Date(2026, month, day), today)

describe("getRelativeDueInfo", () => {
  it("nennt bei überfälligen Aufgaben Datum und Abstand", () => {
    expect(info(9, 20)).toMatchObject({
      label: "20.10.26",
      note: "vor 38 Tagen",
    })
    expect(info(10, 26).note).toBe("vor 1 Tag")
  })

  it("nennt heute mit Datum", () => {
    expect(info(10, 27)).toMatchObject({ label: "27.11.26", note: "heute" })
  })

  it("zeigt künftige Termine nur als Datum", () => {
    expect(info(11, 1).label).toBe("01.12.26")
    expect(info(11, 1).note).toBeUndefined()
  })
})
