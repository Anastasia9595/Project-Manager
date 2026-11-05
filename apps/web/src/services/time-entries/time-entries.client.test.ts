import { afterEach, describe, expect, it, vi } from "vitest"

import { bookTimerEntry } from "@/services/time-entries/time-entries.client"

afterEach(() => vi.unstubAllGlobals())

describe("bookTimerEntry", () => {
  const entry = (seconds: number) => ({
    taskId: "t1",
    startedAt: new Date(2026, 10, 5, 23, 50),
    seconds,
  })

  it("bucht gerundete Minuten am Starttag", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    await bookTimerEntry(entry(90))
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      task: "t1",
      date: "2026-11-05",
      duration_minutes: 2,
      description: null,
    })
  })

  it("bucht mindestens eine Minute", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    await bookTimerEntry(entry(10))
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).duration_minutes).toBe(
      1
    )
  })

  it("bucht höchstens 1440 Minuten, damit die API nicht ablehnt", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    await bookTimerEntry(entry(3 * 24 * 3600))
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).duration_minutes).toBe(
      1440
    )
  })

  it("wirft, wenn die API ablehnt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 403 }))
    )
    await expect(bookTimerEntry(entry(60))).rejects.toThrow()
  })
})
