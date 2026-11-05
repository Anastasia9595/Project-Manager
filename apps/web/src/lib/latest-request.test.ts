import { describe, expect, it } from "vitest"

import { createLatestRequestTracker } from "./latest-request"

describe("createLatestRequestTracker", () => {
  it("vergibt je ID aufsteigende Tickets", () => {
    const tracker = createLatestRequestTracker()
    expect(tracker.begin("a")).toBe(1)
    expect(tracker.begin("a")).toBe(2)
  })

  it("zählt verschiedene IDs unabhängig", () => {
    const tracker = createLatestRequestTracker()
    tracker.begin("a")
    expect(tracker.begin("b")).toBe(1)
  })

  it("meldet ein älteres Ticket nicht mehr als aktuell", () => {
    const tracker = createLatestRequestTracker()
    const first = tracker.begin("a")
    const second = tracker.begin("a")
    expect(tracker.isLatest("a", first)).toBe(false)
    expect(tracker.isLatest("a", second)).toBe(true)
  })
})
