import { afterEach, describe, expect, it, vi } from "vitest"

import { createTimeBookingRepository } from "@/lib/time-tracking/repository"

afterEach(() => vi.unstubAllGlobals())

const booking = {
  id: "e1",
  project: "p1",
  task: "t1",
  date: "2026-11-04",
  duration_minutes: 30,
  description: null,
  user: "u1",
}
const ok = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

describe("createTimeBookingRepository", () => {
  it("lädt die Buchungen der Woche", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ entries: [booking] }))
    vi.stubGlobal("fetch", fetchMock)
    const entries = await createTimeBookingRepository("u1").getEntriesForWeek(
      new Date(2026, 10, 2)
    )
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "/api/time-entries?week=2026-11-02"
    )
    expect(entries).toEqual([booking])
  })

  it("lädt die gebuchten Aufgaben als Set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(ok({ taskIds: ["t1", "t2"] }))
    )
    expect(await createTimeBookingRepository("u1").getBookedTaskIds()).toEqual(
      new Set(["t1", "t2"])
    )
  })

  it("legt an und sendet nur die schreibbaren Felder", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(booking, 201))
    vi.stubGlobal("fetch", fetchMock)
    const created = await createTimeBookingRepository("u1").createEntry({
      project: "p1",
      task: "t1",
      date: "2026-11-04",
      duration_minutes: 30,
      description: null,
      user: "u1",
    })
    expect(created).toEqual(booking)
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/time-entries")
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      task: "t1",
      date: "2026-11-04",
      duration_minutes: 30,
      description: null,
    })
  })

  it("ändert und löscht über die Id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok(booking))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)
    const repository = createTimeBookingRepository("u1")
    await repository.updateEntry("e1", {
      description: "x",
      project: "p1",
      user: "u1",
    })
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/time-entries/e1")
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      description: "x",
    })
    await repository.deleteEntry("e1")
    expect(fetchMock.mock.calls[1]![1].method).toBe("DELETE")
  })

  it("wirft bei Fehlerantworten", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 403 }))
    )
    await expect(
      createTimeBookingRepository("u1").deleteEntry("e1")
    ).rejects.toThrow()
  })
})
