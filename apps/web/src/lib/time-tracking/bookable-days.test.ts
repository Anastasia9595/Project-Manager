import { describe, expect, it } from "vitest"

import { getDefaultBookingDate } from "@/lib/time-tracking/bookable-days"
import { getWorkweekDays } from "@/lib/week"

const DAYS = getWorkweekDays(new Date(2026, 9, 12))

describe("getDefaultBookingDate", () => {
  it("nimmt heute, wenn heute ein Werktag der Woche ist", () => {
    expect(getDefaultBookingDate(DAYS, new Date(2026, 9, 14, 9))).toEqual(
      new Date(2026, 9, 14)
    )
  })

  it("nimmt am Wochenende den Freitag", () => {
    expect(getDefaultBookingDate(DAYS, new Date(2026, 9, 18))).toEqual(
      new Date(2026, 9, 16)
    )
  })

  it("nimmt für eine zukünftige Woche den letzten buchbaren Tag vor heute", () => {
    expect(getDefaultBookingDate(DAYS, new Date(2026, 9, 11))).toEqual(
      new Date(2026, 9, 9)
    )
  })
})
